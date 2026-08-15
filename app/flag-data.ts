export type FlagRecord = {
  id: string;
  name: string;
  shortName: string;
  polity: string;
  startYear: number;
  endYear: number;
  displayYears: string;
  region: "Africa" | "Europe";
  image: string;
  aliases: string[];
  summary: string;
  context: string;
  sourcePage: string;
  license: string;
  sensitive?: boolean;
};

export const FLAGS: FlagRecord[] = [
  {
    id: "holy-roman-empire",
    name: "Holy Roman Emperor banner",
    shortName: "Holy Roman Empire",
    polity: "Holy Roman Empire",
    startYear: 1400,
    endYear: 1806,
    displayYears: "c. 1400–1806",
    region: "Europe",
    image: "/flags/hre.svg",
    aliases: ["first reich", "roman empire", "imperial eagle", "germany"],
    summary:
      "A double-headed imperial eagle banner associated with the Holy Roman Emperor.",
    context:
      "The Empire did not have one modern national flag across its entire history. This is a widely catalogued imperial banner, not a claim that every territory used it.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Banner_of_the_Holy_Roman_Emperor_without_haloes_(1400-1806).svg",
    license: "Public domain; see source record",
  },
  {
    id: "german-empire",
    name: "Flag of the German Empire",
    shortName: "German Empire",
    polity: "German Empire",
    startYear: 1867,
    endYear: 1918,
    displayYears: "1867–1918",
    region: "Europe",
    image: "/flags/german-empire.svg",
    aliases: ["second reich", "kaiserreich", "imperial germany", "prussia"],
    summary:
      "The black-white-red tricolour used by the North German Confederation and German Empire.",
    context:
      "Often called the flag of Imperial Germany. Its use predates the German Empire's 1871 proclamation by four years.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flag_of_Germany_(1867%E2%80%931918).svg",
    license: "Public domain (simple geometry)",
  },
  {
    id: "nazi-germany",
    name: "Flag of Germany under Nazi rule",
    shortName: "Germany, 1935–45",
    polity: "German Reich",
    startYear: 1935,
    endYear: 1945,
    displayYears: "1935–1945",
    region: "Europe",
    image: "/flags/nazi-germany.svg",
    aliases: ["third reich", "nazi germany", "german reich", "ww2"],
    summary:
      "The national flag imposed by Nazi Germany from 1935 until the regime's defeat in 1945.",
    context:
      "This flag contains an extremist symbol associated with dictatorship, genocide and war. It is included for historical reference, not endorsement, and may be restricted by law in some places.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flag_of_Germany_(1935%E2%80%931945).svg",
    license: "Public domain (simple geometry); legal use varies",
    sensitive: true,
  },
  {
    id: "kingdom-italy",
    name: "Civil flag of the Kingdom of Italy",
    shortName: "Kingdom of Italy",
    polity: "Kingdom of Italy",
    startYear: 1861,
    endYear: 1946,
    displayYears: "1861–1946",
    region: "Europe",
    image: "/flags/kingdom-italy.svg",
    aliases: ["royal italy", "italy 1930s", "savoy", "fascist italy"],
    summary:
      "The Italian tricolour bearing the shield of the House of Savoy.",
    context:
      "This civil flag spans the full Kingdom of Italy, including but not limited to the Fascist period. Crowned variants were used in state and military contexts.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flag_of_Italy_(1861%E2%80%931946).svg",
    license: "Public domain dedication; see source record",
  },
  {
    id: "franco-spain",
    name: "Flag of Spain under Franco",
    shortName: "Spanish State",
    polity: "Spanish State",
    startYear: 1945,
    endYear: 1977,
    displayYears: "1945–1977",
    region: "Europe",
    image: "/flags/franco-spain.svg",
    aliases: ["franco spain", "francoist spain", "spanish state", "falange"],
    summary:
      "The red-yellow-red flag with the Eagle of Saint John adopted by the Spanish State in 1945.",
    context:
      "This design covers most of Francisco Franco's dictatorship and remained in use during the early transition after his death. Earlier and later variants differ.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flag_of_Spain_(1945%E2%80%931977).svg",
    license: "CC BY-SA / GFDL; author SanchoPanzaXXI",
    sensitive: true,
  },
  {
    id: "gold-coast",
    name: "Flag of the British Gold Coast",
    shortName: "Gold Coast",
    polity: "British Gold Coast",
    startYear: 1877,
    endYear: 1957,
    displayYears: "1877–1957",
    region: "Africa",
    image: "/flags/gold-coast.svg",
    aliases: ["ghana", "colonial ghana", "british west africa", "accra"],
    summary:
      "A British Blue Ensign bearing the colonial badge of the Gold Coast, now Ghana.",
    context:
      "This was a colonial flag. Ghana adopted its own flag at independence in 1957; including the colonial design does not endorse colonial rule.",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flag_of_the_Gold_Coast_(1877%E2%80%931957).svg",
    license: "Public domain dedication; author Yaddah",
  },
];
