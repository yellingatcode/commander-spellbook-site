import PageWrapper from "../../components/layout/PageWrapper/PageWrapper";
import pluralize from "pluralize";
import CardHeader from "../../components/combo/CardHeader/CardHeader";
import CardGroup from "../../components/combo/CardGroup/CardGroup";
import ColorIdentity from "../../components/layout/ColorIdentity/ColorIdentity";
import ComboList from "../../components/combo/ComboList/ComboList";
import styles from "./combo.module.scss";
import ComboSidebarLinks from "../../components/combo/ComboSidebarLinks/ComboSidebarLinks";
import { GetStaticPaths } from "next";
import SpellbookHead from "../../components/SpellbookHead/SpellbookHead";
import React from "react";
import { Variant} from "../../lib/types";
import PrerequisiteList from "../../components/combo/PrerequisiteList/PrerequisiteList";
import {getPrerequisiteList} from "../../lib/backend-processors";
import EDHRECService from "../../services/edhrec.service";
import VariantService from "../../services/variant.service";
import variantService from "../../services/variant.service";

type Props = {
  combo: Variant;
};

type Price = {
  tcgplayer: string;
  cardkingdom: string;
};
type CardData = {
  name: string;
  oracleImageUrl: string;
  artUrl: string;
};

type ComboData = {
  hasBannedCard: boolean;
  hasPreviewedCard: boolean;
  link: string;
  loaded: boolean;
  comboNumber: string;
  cards: CardData[];
  prices: Price;
  colorIdentity: string[];
  prerequisites: string[];
  steps: string[];
  results: string[];
  edhrecLink: string;
  numberOfDecks: number;
  commanderSpellbookId: string;
};

const NUMBERS = [
  "zero",
  "one",
  "two",
  "three",
  "four",
  "five",
  "six",
  "seven",
  "eight",
  "nine",
  "ten",
];

const Combo = ({ combo }: Props) => {



  const cards = combo.uses.map((card) => {
    return {
      name: card.card.name,
      artUrl: `https://api.scryfall.com/cards/named?format=image&version=art_crop&exact=${card.card.name}`,
      oracleImageUrl: `https://api.scryfall.com/cards/named?format=image&version=normal&exact=${card.card.name}`,
    };
  });
  const cardNames = combo.uses.map(card => card.card.name)
  const cardArts = cards.map((card) => card.artUrl);
  const title =
    cardNames.length === 0
      ? "Looking up Combo"
      : cardNames.slice(0, 3).join(" | ");
  const subtitle =
    cardNames.length < 4
      ? ""
      : cardNames.length === 4
      ? `(and ${NUMBERS[1]} other card)`
      : `(and ${NUMBERS[cardNames.length - 3]} other cards)`;
  const numberOfDecks = combo.popularity;
  const metaData =
    numberOfDecks > 0
      ? [
          `In ${numberOfDecks} ${pluralize(
            "deck",
            numberOfDecks
          )} according to EDHREC.`,
        ]
      : [];

  const colors = Array.from(combo.identity)
  const prerequisites = getPrerequisiteList(combo)
  const steps = combo.description.split('\n');
  const results = combo.produces.map(feature => feature.name)
  const loaded = true;

  return (
    <PageWrapper>
      <SpellbookHead
        title={`${title} ${subtitle}`}
        description={results.reduce(
          (str, result) => str + `\n  * ${result}`,
          "Combo Results:"
        )}
        imageUrl={cardArts[0]}
        useCropDimensions
      />
      <CardHeader cardsArt={cardArts} title={title} subtitle={subtitle} />
      {loaded && <CardGroup cards={cards} />}
      <div className="container md:flex flex-row">
        <div className="w-full md:w-2/3">
          <div className="md:hidden pt-4">
            <ColorIdentity colors={colors} />
          </div>

          <ComboList
            title="Cards"
            id="combo-cards"
            className="lg:hidden"
            includeCardLinks
            cardsInCombo={cardNames}
            iterations={cardNames}
          />

          <PrerequisiteList prerequisites={prerequisites} id="combo-prerequisites" cardsInCombo={cardNames}/>

          <ComboList
            title="Steps"
            id="combo-steps"
            iterations={steps}
            cardsInCombo={cardNames}
            showNumbers
            appendPeriod
          />

          <ComboList
            title="Results"
            id="combo-results"
            iterations={results}
            cardsInCombo={cardNames}
            appendPeriod
          />

          {metaData.length > 0 && (
            <ComboList
              title="Metadata"
              id="combo-metadata"
              iterations={metaData}
            />
          )}
        </div>

        {loaded && (
          <aside className="w-full md:w-1/3 text-center">
            <div id="combo-color-identity" className="my-4 hidden md:block">
              <ColorIdentity colors={colors} />
            </div>

            {!combo.legalities?.commander && (
              <div className={styles.bannedWarning}>
                WARNING: Combo contains cards that are banned in Commander
              </div>
            )}

            {combo.spoiler && (
              <div className={styles.previewedWarning}>
                WARNING: Combo contains cards that have not been released yet
                (and are not yet legal in Commander)
              </div>
            )}

            <ComboSidebarLinks
              cards={cardNames}
              comboLink={`https://commanderspellbook.com/combo/${combo.id}`}
              edhrecLink={EDHRECService.getComboUrl(combo)}
              comboId={combo.id}
              tcgPlayerPrice={combo.prices?.tcgplayer || "-"}
              cardKingdomPrice={combo.prices?.cardkingdom || "-"}
            />
          </aside>
        )}
      </div>
    </PageWrapper>
  );
};

export default Combo;

export const getStaticPaths: GetStaticPaths = async () => {
  const combos = await VariantService.fetchAllVariants()
  const paths = combos.map((combo) => ({
    params: { id: `${combo.id}` },
  }));

  return { paths, fallback: 'blocking' };
};

export const getStaticProps = async ({
  params,
}: {
  params: { id: string };
}) => {

  // Check if it's a legacy combo and reroute if it's found
  if (!params.id.includes('-')) {
    const legacyComboMap = await variantService.fetchLegacyMap()
    const variantId = legacyComboMap[params.id]
    if (variantId) return {
      redirect: {
        destination: `/combo/${variantId}`,
        permanent: false,
      },
    };
  }
  // If it's a new combo id, check the backend
  else  {
    try {
      const backendCombo = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/variants/${params.id}/`).then(res => res.json());
      if (backendCombo && backendCombo.detail !== 'Not found.') {
        return {
          props: {
            combo: backendCombo,
          }
        }
      }
    } catch (err) {
      console.log(err);
    }

  }
  // Finally 404
  return {
    notFound: true,
  };

};
