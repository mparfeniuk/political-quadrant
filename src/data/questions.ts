export type Language = "ua" | "en";

export type Question = {
  id: string;
  axis: "social" | "economic";
  text: Record<Language, string>;
};

export type QuadrantKey = "topRight" | "topLeft" | "bottomRight" | "bottomLeft";

export type QuadrantDetail = {
  title: Record<Language, string>;
  description: Record<Language, string>;
  states: Record<Language, string[]>;
  figures: Record<Language, string[]>;
};

export const socialQuestions: Question[] = [
  {
    id: "s1",
    axis: "social",
    text: {
      ua: "Чи має держава визначати, яку мораль та культурні норми просувати в суспільстві?",
      en: "Should the state define which morals and cultural norms to promote in society?",
    },
  },
  {
    id: "s2",
    axis: "social",
    text: {
      ua: "Чи має держава контролювати зміст шкільної освіти (програми, підручники)?",
      en: "Should the state control school curricula and textbooks?",
    },
  },
  {
    id: "s3",
    axis: "social",
    text: {
      ua: "Чи повинна держава встановлювати стандарти поведінки в сім’ї (виховання, ролі батьків)?",
      en: "Should the state set standards for family life (parental roles, upbringing)?",
    },
  },
  {
    id: "s4",
    axis: "social",
    text: {
      ua: "Чи повинна держава регулювати релігійну діяльність та обмежувати «небезпечні» рухи?",
      en: "Should the state regulate religious activity and restrict “dangerous” movements?",
    },
  },
  {
    id: "s5",
    axis: "social",
    text: {
      ua: "Чи має держава контролювати медіа та інтернет задля «соціальної стабільності»?",
      en: "Should the state control media and the internet for “social stability”?",
    },
  },
  {
    id: "s6",
    axis: "social",
    text: {
      ua: "Чи повинна держава забезпечувати безпеку громадян навіть ціною обмеження приватності?",
      en: "Should the state ensure security even at the cost of limiting privacy?",
    },
  },
  {
    id: "s7",
    axis: "social",
    text: {
      ua: "Чи має держава активно підтримувати спорт, дозвілля й культурні ініціативи бюджетом?",
      en: "Should the state actively fund sports, leisure, and cultural initiatives?",
    },
  },
  {
    id: "s8",
    axis: "social",
    text: {
      ua: "Чи має держава керувати судовою системою централізовано?",
      en: "Should the state centrally control the judicial system?",
    },
  },
  {
    id: "s9",
    axis: "social",
    text: {
      ua: "Чи має держава самостійно планувати та будувати інфраструктуру?",
      en: "Should the state exclusively plan and build infrastructure?",
    },
  },
  {
    id: "s10",
    axis: "social",
    text: {
      ua: "Чи має держава контролювати армію та оборону як монополіст?",
      en: "Should the state monopolize control of the army and defense?",
    },
  },
  {
    id: "s11",
    axis: "social",
    text: {
      ua: "Чи повинна держава встановлювати обов’язкові стандарти моралі та етики в публічному просторі?",
      en: "Should the state set mandatory moral and ethical standards in public life?",
    },
  },
  {
    id: "s12",
    axis: "social",
    text: {
      ua: "Чи має держава встановлювати обов’язкову мовну політику (офіційні мови в освіті, медіа та держсекторі)?",
      en: "Should the state set mandatory language policy (official languages for education, media, and the public sector)?",
    },
  },
  {
    id: "s13",
    axis: "social",
    text: {
      ua: "Чи повинна держава регулювати культурні події та мистецтво, відбираючи «безпечний» контент?",
      en: "Should the state regulate cultural events and art by selecting what is “safe” content?",
    },
  },
  {
    id: "s14",
    axis: "social",
    text: {
      ua: "Чи має держава встановлювати загальнообов’язкові вимоги до вакцинацій і медичних втручань?",
      en: "Should the state set mandatory requirements for vaccinations and medical interventions?",
    },
  },
  {
    id: "s15",
    axis: "social",
    text: {
      ua: "Чи повинна держава визначати норми поведінки в онлайн-просторі та обмежувати анонімність?",
      en: "Should the state define behavior norms online and limit anonymity?",
    },
  },
];

export const economicQuestions: Question[] = [
  {
    id: "e1",
    axis: "economic",
    text: {
      ua: "Чи повинна держава встановлювати мінімальну зарплату?",
      en: "Should the state set a minimum wage?",
    },
  },
  {
    id: "e2",
    axis: "economic",
    text: {
      ua: "Чи має держава контролювати тарифи на електроенергію, газ, воду?",
      en: "Should the state control utility tariffs (electricity, gas, water)?",
    },
  },
  {
    id: "e3",
    axis: "economic",
    text: {
      ua: "Чи повинна держава обмежувати великі корпорації, щоб запобігати монополіям?",
      en: "Should the state limit large corporations to prevent monopolies?",
    },
  },
  {
    id: "e4",
    axis: "economic",
    text: {
      ua: "Чи має держава встановлювати високі податки для фінансування соцпрограм?",
      en: "Should the state impose high taxes to fund social programs?",
    },
  },
  {
    id: "e5",
    axis: "economic",
    text: {
      ua: "Чи повинна держава захищати місцевий бізнес митами?",
      en: "Should the state protect local business with tariffs?",
    },
  },
  {
    id: "e6",
    axis: "economic",
    text: {
      ua: "Чи має держава контролювати банки й фінансові ринки?",
      en: "Should the state control banks and financial markets?",
    },
  },
  {
    id: "e7",
    axis: "economic",
    text: {
      ua: "Чи повинна держава володіти природними ресурсами?",
      en: "Should the state own natural resources?",
    },
  },
  {
    id: "e8",
    axis: "economic",
    text: {
      ua: "Чи має держава встановлювати обов’язкові стандарти якості товарів?",
      en: "Should the state set mandatory quality standards for all goods?",
    },
  },
  {
    id: "e9",
    axis: "economic",
    text: {
      ua: "Чи повинна держава створювати державні підприємства?",
      en: "Should the state actively create state-owned enterprises?",
    },
  },
  {
    id: "e10",
    axis: "economic",
    text: {
      ua: "Чи має держава регулювати ціни на ринку?",
      en: "Should the state regulate market prices?",
    },
  },
  {
    id: "e11",
    axis: "economic",
    text: {
      ua: "Чи повинна держава адмініструвати та гарантувати пенсійну систему (накопичення, виплати)?",
      en: "Should the state administer and guarantee the pension system (contributions and payouts)?",
    },
  },
  {
    id: "e12",
    axis: "economic",
    text: {
      ua: "Чи має держава контролювати емісію грошей і монетарну політику (центральний банк)?",
      en: "Should the state control money issuance and monetary policy (central bank)?",
    },
  },
  {
    id: "e13",
    axis: "economic",
    text: {
      ua: "Чи повинна держава обмежувати або оподатковувати криптовалюти та альтернативні платіжні системи?",
      en: "Should the state restrict or tax cryptocurrencies and alternative payment systems?",
    },
  },
  {
    id: "e14",
    axis: "economic",
    text: {
      ua: "Чи має держава встановлювати правила для орендних ставок і контролювати ринок житла?",
      en: "Should the state set rules on rent levels and control the housing market?",
    },
  },
  {
    id: "e15",
    axis: "economic",
    text: {
      ua: "Чи повинна держава субсидіювати стратегічні галузі (енергетика, медицина, оборона) бюджетом?",
      en: "Should the state subsidize strategic industries (energy, healthcare, defense) with public funds?",
    },
  },
];

export const quadrantLabels: Record<
  Language,
  {
    topRight: string;
    topLeft: string;
    bottomRight: string;
    bottomLeft: string;
  }
> = {
  ua: {
    topRight: "Державний контроль у всьому",
    topLeft: "Соціальний етатизм, але ринок працює",
    bottomRight: "Економічний етатизм, соціальна свобода",
    bottomLeft: "Лібералізм",
  },
  en: {
    topRight: "State control in everything",
    topLeft: "Social statism with a working market",
    bottomRight: "Economic statism with social freedom",
    bottomLeft: "Liberalism",
  },
};

export const quadrantDetails: Record<QuadrantKey, QuadrantDetail> = {
  topRight: {
    title: {
      ua: "Державний контроль у всьому",
      en: "State control in everything",
    },
    description: {
      ua: "Високий рівень контролю в економіці та соціальній сфері. Держава визначає правила, координує ресурси й цінності.",
      en: "High control over both economy and social sphere. The state sets rules, coordinates resources and values.",
    },
    states: {
      ua: ["Північна Корея", "Куба (історично)", "СРСР (пізній)"],
      en: ["North Korea", "Cuba (historically)", "USSR (late period)"],
    },
    figures: {
      ua: ["Кім Чен Ин", "Фідель Кастро", "Йосип Сталін"],
      en: ["Kim Jong-un", "Fidel Castro", "Joseph Stalin"],
    },
  },
  topLeft: {
    title: {
      ua: "Соціальний етатизм, але ринок працює",
      en: "Social statism with a working market",
    },
    description: {
      ua: "Жорсткий соціальний контроль із діючим ринком. Держава формує культурні та політичні рамки, допускає економічну активність.",
      en: "Tight social control with a functioning market. The state frames culture and politics while allowing market activity.",
    },
    states: {
      ua: ["Китай", "Сінгапур (частково)"],
      en: ["China", "Singapore (partially)"],
    },
    figures: {
      ua: ["Ден Сяопін", "Лі Куан Ю"],
      en: ["Deng Xiaoping", "Lee Kuan Yew"],
    },
  },
  bottomRight: {
    title: {
      ua: "Економічний етатизм, соціальна свобода",
      en: "Economic statism with social freedom",
    },
    description: {
      ua: "Держава активно втручається в економіку, але соціальні свободи лишаються ширшими.",
      en: "The state intervenes strongly in the economy while social freedoms remain broader.",
    },
    states: {
      ua: ["Скандинавські країни (умовно)", "Франція (соціальна держава)"],
      en: ["Nordic countries (broadly)", "France (social state)"],
    },
    figures: {
      ua: ["Олоф Пальме", "Франсуа Міттеран"],
      en: ["Olof Palme", "François Mitterrand"],
    },
  },
  bottomLeft: {
    title: {
      ua: "Лібералізм",
      en: "Liberalism",
    },
    description: {
      ua: "Низький державний контроль в економіці й соціальній сфері. Пріоритет — особиста свобода та ринок.",
      en: "Low state control in both economy and social life. Priority on individual freedom and markets.",
    },
    states: {
      ua: ["США (умовно)", "Нідерланди", "Швейцарія"],
      en: ["USA (broadly)", "Netherlands", "Switzerland"],
    },
    figures: {
      ua: ["Мілтон Фрідман", "Рон Пол"],
      en: ["Milton Friedman", "Ron Paul"],
    },
  },
};

export const axisLabels: Record<
  Language,
  { x: string; y: string; title: string }
> = {
  ua: {
    x: "Економіка: 0 приватна — 100 державна",
    y: "Соціальна сфера: 0 свобода — 100 контроль держави",
    title: "Політичний квадрат",
  },
  en: {
    x: "Economy: 0 private — 100 state",
    y: "Social: 0 freedom — 100 state control",
    title: "Political Quadrant",
  },
};

export const avatarEmojis = [
  "👻",
  "💀",
  "☠️",
  "👽",
  "👾",
  "🤖",
  "🐶",
  "🐱",
  "🐭",
  "🐹",
  "🐰",
  "🦊",
  "🐻",
  "🐼",
  "🐨",
  "🐯",
  "🦁",
  "🐮",
  "🐷",
  "🐸",
  "🐵",
  "🙈",
  "🙉",
  "🙊",
  "🐒",
  "🦍",
  "🦧",
  "🐔",
  "🐧",
  "🐦",
  "🐤",
  "🐣",
  "🦇",
  "🐺",
  "🐗",
  "🦝",
  "🦨",
  "🦡",
  "🐴",
  "🫏",
  "🦓",
  "🦌",
  "🦬",
  "🐂",
  "🐃",
  "🐄",
  "🦙",
  "🦒",
  "🐪",
  "🐫",
  "🐘",
  "🦣",
  "🐁",
  "🐀",
  "🐇",
  "🦫",
  "🦔",
  "🦦",
  "🦥",
  "🐿️",
  "🦘",
  "🐉",
  "🦖",
  "🦕",
  "🐢",
  "🐍",
  "🦎",
  "🐟",
  "🐠",
  "🐡",
  "🦈",
  "🐬",
  "🐳",
  "🐋",
  "🦅",
  "🦆",
  "🦢",
  "🦜",
  "🦩",
  "🕊️",
  "🦉",
  "🦄",
  "🐲",
];
