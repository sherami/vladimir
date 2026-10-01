const analytics = (
  tac: number,
  netYield: number,
  productionReturn: number | null,
  score: number | null,
  riskLabel: string | null,
  confidence: number,
  verdict: string | null,
) => ({
  tac,
  netYield,
  productionReturnMetric: "IRR",
  productionReturn,
  riskAdjustedScore: score,
  riskLabel,
  dataConfidence: confidence,
  finalVerdict: verdict,
  methodologyVersion: "1.0",
});

const seeds = [
  {
    id: "preview-layan-verde-b3-301",
    project: "Layan Verde",
    unit: "B3-301 · Studio 38.63 sqm · Garden view",
    imageUrl: "/assets/b3-301/interior.webp",
    media: [
      { src: "/assets/b3-301/masterplan.webp", label: "Master plan", kind: "Project" },
      { src: "/assets/b3-301/floorplan.webp", label: "B3-301 floor plan · 38.63 sqm", kind: "Unit" },
      { src: "/assets/b3-301/amenities.webp", label: "Project amenity render", kind: "Project" },
      { src: "/assets/b3-301/architecture.webp", label: "Landscape architecture", kind: "Project" },
      { src: "/assets/b3-301/interior-storage.webp", label: "Built-in storage", kind: "Interior" },
      { src: "/assets/b3-301/interior-bathroom.webp", label: "Bathroom finish", kind: "Interior" },
    ],
    headline:
      "A documented entry price, with the return still dependent on assumptions.",
    summary:
      "A current Leasehold offer with furniture included and a transparent 35% instalment scenario. The 6%-7% owner yield remains a PrivatePhuket estimate, while exact payment dates and the detailed rental-pool agreement are still outstanding.",
    price: 10_009_033,
    priceStatus: "VERIFIED_DOCUMENT",
    noiStatus: "PP_ESTIMATE",
    analytics: {
      ...analytics(10_166_968, 0.065, null, null, null, 71, null),
      productionReturnMetric: "XIRR",
    },
    dealFacts: [
      { label: "Ownership", value: "Leasehold · initial 30 years" },
      { label: "Completion", value: "Q4 2028 · extension risk" },
      { label: "Furniture", value: "Included" },
      { label: "Rental pool", value: "60% owner · 40% management" },
    ],
    paymentSchedule: [
      { date: "01 Oct 2026", label: "Reservation", amount: 200_000 },
      {
        date: "15 Oct 2026",
        label: "First payment · 35% option",
        amount: 3_433_162,
      },
      { date: "15 Apr 2027", label: "Payment 2", amount: 1_275_174 },
      { date: "15 Oct 2027", label: "Payment 3", amount: 1_275_174 },
      { date: "15 Apr 2028", label: "Payment 4", amount: 1_275_174 },
      { date: "15 Oct 2028", label: "Payment 5", amount: 1_275_174 },
      { date: "15 Apr 2029", label: "Payment 6", amount: 1_275_175 },
    ],
    whyBuy: [
      "The current offer is valid through 25 October 2026 and includes furniture.",
      "Documented entry costs reconcile to a total acquisition cost of 10,166,968 THB.",
      "The 35% payment option reduces the amount committed at the start of construction.",
    ],
    whyNotBuy: [
      "Completion is targeted for Q4 2028, but the draft permits extensions and construction risk remains material.",
      "The draft payment annex conflicts with the current commercial offer and must be corrected before signing.",
      "The 6%-7% yield is a PrivatePhuket scenario, not actual operating history or a guarantee.",
    ],
    sources: [
      {
        status: "VERIFIED_DOCUMENT",
        label: "B3-301 offer: 10,009,033 THB, furniture included",
      },
      {
        status: "VERIFIED_DOCUMENT",
        label: "Leasehold draft: 30-year initial term and Q4 2028 target",
      },
      {
        status: "TO_VERIFY",
        label: "Exact payment dates and corrected Annex B",
      },
      { status: "PP_ESTIMATE", label: "Owner NOI midpoint: 660,853 THB/year" },
    ],
    scenarios: [
      {
        name: "Payment model",
        text: "200,000 THB reservation, 3,433,162 THB after 14 days, then five instalments every six months. Dates are provisional.",
      },
      {
        name: "Rental model",
        text: "40% of profit to management and 60% to the owner; detailed deductible costs are not yet documented.",
      },
      {
        name: "Return range",
        text: "PrivatePhuket estimates 6%-7% net yield. The card displays the 6.5% midpoint, not a guaranteed return.",
      },
    ],
  },
  {
    id: "demo-layan-01",
    project: "Layan Ridge Residences",
    unit: "Villa L-07",
    headline: "Privacy with a disciplined entry price.",
    summary:
      "A low-density villa scenario where location quality is strong, but the investment case still depends on controlled operating costs and a realistic exit.",
    imageUrl:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=85",
    price: 18_900_000,
    priceStatus: "DEVELOPER_MODEL",
    noiStatus: "PP_ESTIMATE",
    analytics: analytics(20_150_000, 0.064, 0.108, 81.4, "MODERATE", 86, "BUY"),
    whyBuy: [
      "Low-density product in an established premium micro-location.",
      "Entry price leaves room for furnishing and transaction costs.",
      "Exit assumptions do not rely on aggressive double-digit growth.",
    ],
    whyNotBuy: [
      "Villa operations require active cost control.",
      "Resale liquidity is narrower than for a compact condominium.",
      "Rental demand is seasonal and management quality is material.",
    ],
    sources: [
      { status: "DEVELOPER_MODEL", label: "Price and payment schedule" },
      { status: "MARKET_DATA", label: "Comparable villa asking prices" },
      { status: "PP_ESTIMATE", label: "Operating cost model" },
    ],
    scenarios: [
      {
        name: "Base",
        text: "5-year hold, 4.0% annual value growth, 5.0% selling cost.",
      },
      { name: "Bear", text: "Flat exit value and 12% lower annual NOI." },
      { name: "Bull", text: "6.0% annual growth with stable occupancy." },
    ],
  },
  {
    id: "demo-bangtao-02",
    project: "Bang Tao Courtyard",
    unit: "Residence C-12",
    headline: "The strongest income profile in the shortlist.",
    summary:
      "A one-bedroom residence close to everyday infrastructure. The model favours rental economics, while supply pressure keeps the verdict below an unconditional recommendation.",
    imageUrl:
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1600&q=85",
    price: 9_750_000,
    priceStatus: "VERIFIED_DOCUMENT",
    noiStatus: "MARKET_DATA",
    analytics: analytics(
      10_390_000,
      0.079,
      0.126,
      76.8,
      "ELEVATED",
      91,
      "CONSIDER",
    ),
    whyBuy: [
      "Walkable access to established Bang Tao infrastructure.",
      "Compact format supports a broad rental audience.",
      "Net yield remains resilient in the base model.",
    ],
    whyNotBuy: [
      "Significant competing condominium supply is planned nearby.",
      "The return is sensitive to daily-rate compression.",
      "View and floor differences can materially affect resale.",
    ],
    sources: [
      { status: "VERIFIED_DOCUMENT", label: "Developer price list" },
      { status: "MARKET_DATA", label: "Comparable rental evidence" },
      { status: "VERIFIED_DOCUMENT", label: "Unit specification" },
    ],
    scenarios: [
      {
        name: "Base",
        text: "5-year hold, 3.5% annual value growth, 5.0% selling cost.",
      },
      { name: "Bear", text: "15% lower NOI and no capital growth." },
      {
        name: "Bull",
        text: "5.5% annual growth and stronger high-season rates.",
      },
    ],
  },
  {
    id: "demo-naiyang-03",
    project: "Nai Yang Garden Suites",
    unit: "Suite B-34",
    headline: "Lower entry cost, higher location concentration.",
    summary:
      "An accessible resort-apartment scenario near the airport and national park. The numbers are attractive, but demand concentration and developer execution require a larger margin of safety.",
    imageUrl:
      "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=1600&q=85",
    price: 6_450_000,
    priceStatus: "DEVELOPER_MODEL",
    noiStatus: "DEVELOPER_CLAIM",
    analytics: analytics(6_920_000, 0.073, 0.097, 68.9, "HIGH", 72, "WATCH"),
    whyBuy: [
      "Lower absolute ticket than the other preview scenarios.",
      "Airport and national-park demand provide clear positioning.",
      "Compact format limits furnishing and maintenance exposure.",
    ],
    whyNotBuy: [
      "Confidence is below the final-verdict threshold.",
      "Income evidence is still a developer claim, not operating history.",
      "The location has a narrower year-round tenant base.",
    ],
    sources: [
      { status: "DEVELOPER_MODEL", label: "Price and payment schedule" },
      { status: "DEVELOPER_CLAIM", label: "Rental projection" },
      { status: "TO_VERIFY", label: "Final common-area fee" },
    ],
    scenarios: [
      {
        name: "Base",
        text: "5-year hold, 3.0% annual value growth, 5.0% selling cost.",
      },
      { name: "Bear", text: "20% lower NOI and flat exit value." },
      { name: "Bull", text: "5.0% annual growth with improved occupancy." },
    ],
  },
];

const russian: Record<string, any> = {
  "preview-layan-verde-b3-301": {
    unit: "B3-301 · студия 38,63 м² · вид на сад",
    media: [
      { src: "/assets/b3-301/masterplan.webp", label: "Генеральный план", kind: "Проект" },
      { src: "/assets/b3-301/floorplan.webp", label: "Планировка B3-301 · 38,63 м²", kind: "Квартира" },
      { src: "/assets/b3-301/amenities.webp", label: "Визуализация инфраструктуры", kind: "Проект" },
      { src: "/assets/b3-301/architecture.webp", label: "Архитектура и озеленение", kind: "Проект" },
      { src: "/assets/b3-301/interior-storage.webp", label: "Встроенная система хранения", kind: "Интерьер" },
      { src: "/assets/b3-301/interior-bathroom.webp", label: "Отделка ванной комнаты", kind: "Интерьер" },
    ],
    headline: "Цена входа подтверждена. Доходность пока нужно доказать.",
    summary:
      "Актуальное предложение Leasehold с включённой мебелью и понятным сценарием рассрочки 35%. Доходность собственника 6–7% остаётся оценкой PrivatePhuket: точные даты платежей и подробный договор rental pool ещё не получены.",
    dealFacts: [
      { label: "Форма владения", value: "Leasehold · первоначально 30 лет" },
      { label: "Сдача", value: "IV квартал 2028 · есть риск переноса" },
      { label: "Мебель", value: "Включена" },
      { label: "Rental pool", value: "60% собственнику · 40% УК" },
    ],
    paymentSchedule: [
      { date: "01.10.2026", label: "Бронь", amount: 200_000 },
      {
        date: "15.10.2026",
        label: "Первый платёж · вариант 35%",
        amount: 3_433_162,
      },
      { date: "15.04.2027", label: "Платёж 2", amount: 1_275_174 },
      { date: "15.10.2027", label: "Платёж 3", amount: 1_275_174 },
      { date: "15.04.2028", label: "Платёж 4", amount: 1_275_174 },
      { date: "15.10.2028", label: "Платёж 5", amount: 1_275_174 },
      { date: "15.04.2029", label: "Платёж 6", amount: 1_275_175 },
    ],
    whyBuy: [
      "Коммерческое предложение действует до 25 октября 2026 года, мебель включена.",
      "Подтверждённые расходы на вход сходятся в полную стоимость 10 166 968 THB.",
      "Схема с первым взносом 35% снижает объём капитала, необходимого в начале строительства.",
    ],
    whyNotBuy: [
      "Завершение заявлено на IV квартал 2028 года, но договор допускает продление, а объём оставшихся работ всё ещё значительный.",
      "Приложение с платежами в драфте расходится с актуальным предложением и должно быть исправлено до подписания.",
      "Доходность 6–7% — сценарий PrivatePhuket, а не фактическая история эксплуатации и не гарантия.",
    ],
    sources: [
      {
        status: "VERIFIED_DOCUMENT",
        label: "Предложение B3-301: 10 009 033 THB, мебель включена",
      },
      {
        status: "VERIFIED_DOCUMENT",
        label:
          "Драфт Leasehold: первоначальный срок 30 лет и цель IV квартал 2028",
      },
      {
        status: "TO_VERIFY",
        label: "Точные даты платежей и исправленное приложение B",
      },
      {
        status: "PP_ESTIMATE",
        label: "Средний сценарный NOI собственника: 660 853 THB в год",
      },
    ],
    scenarios: [
      {
        name: "График оплаты",
        text: "200 000 THB — бронь, 3 433 162 THB — через 14 дней, затем пять платежей каждые шесть месяцев. Даты предварительные.",
      },
      {
        name: "Rental pool",
        text: "40% прибыли получает УК, 60% — собственник; полный перечень удерживаемых расходов пока не раскрыт.",
      },
      {
        name: "Диапазон доходности",
        text: "PrivatePhuket оценивает чистую доходность в 6–7%. В карточке показана середина диапазона — 6,5%, без гарантии.",
      },
    ],
  },
  "demo-layan-01": {
    unit: "Вилла L-07",
    headline: "Приватность без переплаты за красивую историю.",
    summary:
      "Малоэтажный вилловый проект в сильной премиальной локации. Инвестиционный результат зависит от контроля эксплуатационных расходов и реалистичной цены выхода.",
    whyBuy: [
      "Малоэтажный формат в сформировавшейся премиальной микролокации.",
      "Цена входа оставляет резерв на мебель и транзакционные расходы.",
      "Сценарий выхода не требует агрессивного двузначного роста.",
    ],
    whyNotBuy: [
      "Эксплуатация виллы требует активного контроля затрат.",
      "Ликвидность при перепродаже ниже, чем у компактных кондоминиумов.",
      "Арендный спрос сезонный и сильно зависит от качества управления.",
    ],
    sources: [
      { status: "DEVELOPER_MODEL", label: "Цена и график платежей" },
      { status: "MARKET_DATA", label: "Предложения сопоставимых вилл" },
      { status: "PP_ESTIMATE", label: "Модель эксплуатационных расходов" },
    ],
    scenarios: [
      {
        name: "Базовый",
        text: "Владение 5 лет, рост стоимости 4,0% в год, расходы при продаже 5,0%.",
      },
      {
        name: "Негативный",
        text: "Цена выхода без роста, годовой NOI ниже на 12%.",
      },
      { name: "Позитивный", text: "Рост 6,0% в год при стабильной загрузке." },
    ],
  },
  "demo-bangtao-02": {
    unit: "Резиденция C-12",
    headline: "Самая сильная доходная модель в шорт-листе.",
    summary:
      "Резиденция с одной спальней рядом с повседневной инфраструктурой. Модель выигрывает за счёт аренды, но рост предложения не позволяет дать безусловную рекомендацию.",
    whyBuy: [
      "Вся сформировавшаяся инфраструктура Банг Тао доступна пешком.",
      "Компактный формат рассчитан на широкую арендную аудиторию.",
      "Чистая доходность устойчива в базовом сценарии.",
    ],
    whyNotBuy: [
      "Поблизости запланирован значительный объём нового предложения.",
      "Результат чувствителен к снижению среднесуточной ставки.",
      "Этаж и вид могут существенно влиять на перепродажу.",
    ],
    sources: [
      { status: "VERIFIED_DOCUMENT", label: "Прайс-лист девелопера" },
      { status: "MARKET_DATA", label: "Сопоставимые арендные предложения" },
      { status: "VERIFIED_DOCUMENT", label: "Спецификация юнита" },
    ],
    scenarios: [
      {
        name: "Базовый",
        text: "Владение 5 лет, рост стоимости 3,5% в год, расходы при продаже 5,0%.",
      },
      {
        name: "Негативный",
        text: "NOI ниже на 15%, рост капитальной стоимости отсутствует.",
      },
      {
        name: "Позитивный",
        text: "Рост 5,5% в год и более сильные ставки высокого сезона.",
      },
    ],
  },
  "demo-naiyang-03": {
    unit: "Апартамент B-34",
    headline: "Ниже порог входа, выше зависимость от локации.",
    summary:
      "Доступный курортный апартамент рядом с аэропортом и национальным парком. Цифры привлекательны, но концентрация спроса и риск исполнения требуют большего запаса прочности.",
    whyBuy: [
      "Самый низкий абсолютный порог входа среди демо-сценариев.",
      "Близость аэропорта и национального парка создаёт ясное позиционирование.",
      "Компактный формат ограничивает затраты на мебель и обслуживание.",
    ],
    whyNotBuy: [
      "Достоверность данных ниже порога финального Verdict.",
      "Доход пока подтверждён заявлением девелопера, а не историей эксплуатации.",
      "Круг круглогодичных арендаторов в этой локации уже.",
    ],
    sources: [
      { status: "DEVELOPER_MODEL", label: "Цена и график платежей" },
      { status: "DEVELOPER_CLAIM", label: "Прогноз аренды" },
      { status: "TO_VERIFY", label: "Финальный размер платы за общие зоны" },
    ],
    scenarios: [
      {
        name: "Базовый",
        text: "Владение 5 лет, рост стоимости 3,0% в год, расходы при продаже 5,0%.",
      },
      { name: "Негативный", text: "NOI ниже на 20%, цена выхода без роста." },
      { name: "Позитивный", text: "Рост 5,0% в год при улучшении загрузки." },
    ],
  },
};

const localized = (item: any) =>
  language === "ru" ? { ...item, ...russian[item.id] } : item;

export const demoCatalog = seeds.map((seed) => {
  const {
    price,
    priceStatus,
    noiStatus,
    whyBuy,
    whyNotBuy,
    sources,
    scenarios,
    ...item
  } = localized(seed);
  return {
    ...item,
    purchasePrice: { value: price, status: priceStatus },
    annualNoi: {
      value: item.analytics.tac * item.analytics.netYield,
      status: noiStatus,
    },
    analytics: {
      ...item.analytics,
      verdictStatus: "PROVISIONAL",
      finalVerdict: undefined,
    },
  };
});

export function demoProperty(id: string) {
  const seed = seeds.find((x) => x.id === id);
  if (!seed) return undefined;
  const item = localized(seed);
  return {
    publication: {
      id: `publication-${item.id}`,
      property_id: item.id,
      calculation_run_id: `preview-${item.id}`,
      published_at: "2026-09-18T00:00:00.000Z",
    },
    lifecycle: { status: "DESIGN_PREVIEW" },
    snapshot: {
      property: {
        id: item.id,
        project: item.project,
        unit: item.unit,
        purchasePrice: { value: item.price, status: item.priceStatus },
        annualNoi: {
          value: item.analytics.tac * item.analytics.netYield,
          status: item.noiStatus,
        },
      },
      analytics: {
        ...item.analytics,
        finalVerdict: undefined,
        calculationRunId: `preview-${item.id}`,
        engineVersion: "preview-1.0",
        inputSnapshotHash: "illustrative-preview-data",
        verdictStatus: "PROVISIONAL",
      },
      narrative: {
        headline: item.headline,
        summary: item.summary,
        whyBuy: item.whyBuy,
        whyNotBuy: item.whyNotBuy,
      },
      sourceDisclosures: item.sources,
      scenarioDisclosures: item.scenarios,
      dealFacts: item.dealFacts,
      paymentSchedule: item.paymentSchedule,
      media: item.media,
      frozenAt: "2026-09-18T00:00:00.000Z",
      imageUrl: item.imageUrl,
    },
  };
}
import { language } from "./i18n";
