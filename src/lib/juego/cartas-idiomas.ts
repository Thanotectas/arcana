import type { CartaTarot } from "@/lib/tarot/deck";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Lo que el juego necesita de cada carta en inglés y portugués: el nombre tradicional y las palabras de las pistas
 * (4 de su luz y 2 de su sombra). En español se usa el mazo tal cual.
 */
const MAYORES: Record<string, { en: string; pt: string }> = {
  "el-loco": { en: "The Fool", pt: "O Louco" },
  "el-mago": { en: "The Magician", pt: "O Mago" },
  "la-sacerdotisa": { en: "The High Priestess", pt: "A Sacerdotisa" },
  "la-emperatriz": { en: "The Empress", pt: "A Imperatriz" },
  "el-emperador": { en: "The Emperor", pt: "O Imperador" },
  "el-sumo-sacerdote": { en: "The Hierophant", pt: "O Hierofante" },
  "los-enamorados": { en: "The Lovers", pt: "Os Enamorados" },
  "el-carro": { en: "The Chariot", pt: "O Carro" },
  "la-fuerza": { en: "Strength", pt: "A Força" },
  "el-ermitano": { en: "The Hermit", pt: "O Eremita" },
  "la-rueda-de-la-fortuna": { en: "Wheel of Fortune", pt: "A Roda da Fortuna" },
  "la-justicia": { en: "Justice", pt: "A Justiça" },
  "el-colgado": { en: "The Hanged Man", pt: "O Enforcado" },
  "la-muerte": { en: "Death", pt: "A Morte" },
  "la-templanza": { en: "Temperance", pt: "A Temperança" },
  "el-diablo": { en: "The Devil", pt: "O Diabo" },
  "la-torre": { en: "The Tower", pt: "A Torre" },
  "la-estrella": { en: "The Star", pt: "A Estrela" },
  "la-luna": { en: "The Moon", pt: "A Lua" },
  "el-sol": { en: "The Sun", pt: "O Sol" },
  "el-juicio": { en: "Judgement", pt: "O Julgamento" },
  "el-mundo": { en: "The World", pt: "O Mundo" },
};

const PALOS: Record<string, { en: string; pt: string }> = {
  bastos: { en: "Wands", pt: "Paus" },
  copas: { en: "Cups", pt: "Copas" },
  espadas: { en: "Swords", pt: "Espadas" },
  oros: { en: "Pentacles", pt: "Ouros" },
};
const RANGOS: Record<number, { en: string; pt: string }> = {
  1: { en: "Ace", pt: "Ás" },
  2: { en: "Two", pt: "Dois" },
  3: { en: "Three", pt: "Três" },
  4: { en: "Four", pt: "Quatro" },
  5: { en: "Five", pt: "Cinco" },
  6: { en: "Six", pt: "Seis" },
  7: { en: "Seven", pt: "Sete" },
  8: { en: "Eight", pt: "Oito" },
  9: { en: "Nine", pt: "Nove" },
  10: { en: "Ten", pt: "Dez" },
  11: { en: "Page", pt: "Valete" },
  12: { en: "Knight", pt: "Cavaleiro" },
  13: { en: "Queen", pt: "Rainha" },
  14: { en: "King", pt: "Rei" },
};

/** «luz1|luz2|luz3|luz4;sombra1|sombra2» por carta, en inglés y portugués. */
const PALABRAS: Record<string, [string, string]> = {
  "el-loco": ["beginnings|freedom|spontaneity|faith;recklessness|rashness", "começos|liberdade|espontaneidade|fé;imprudência|temeridade"],
  "el-mago": ["willpower|skill|manifestation|resources;manipulation|deceit", "vontade|habilidade|manifestação|recursos;manipulação|engano"],
  "la-sacerdotisa": ["intuition|mystery|inner wisdom|silence;harmful secrets|disconnection", "intuição|mistério|sabedoria interior|silêncio;segredos nocivos|desconexão"],
  "la-emperatriz": ["abundance|fertility|creativity|nurturing;dependence|creative block", "abundância|fertilidade|criatividade|nutrição;dependência|bloqueio criativo"],
  "el-emperador": ["authority|structure|stability|leadership;tyranny|rigidity", "autoridade|estrutura|estabilidade|liderança;tirania|rigidez"],
  "el-sumo-sacerdote": ["tradition|teaching|institutions|beliefs;rebellion|dogmatism", "tradição|ensino|instituições|crenças;rebeldia|dogmatismo"],
  "los-enamorados": ["union|choice|harmony|attraction;imbalance|indecision", "união|escolha|harmonia|atração;desequilíbrio|indecisão"],
  "el-carro": ["victory|determination|control|progress;lack of direction|aggression", "vitória|determinação|controle|avanço;falta de direção|agressividade"],
  "la-fuerza": ["courage|patience|compassion|inner mastery;weakness|insecurity", "coragem|paciência|compaixão|domínio interior;fraqueza|insegurança"],
  "el-ermitano": ["introspection|search|solitude|wisdom;isolation|unwanted loneliness", "introspecção|busca|solidão|sabedoria;isolamento|solidão indesejada"],
  "la-rueda-de-la-fortuna": ["change|cycles|destiny|luck;bad streak|resisting change", "mudança|ciclos|destino|sorte;má fase|resistência à mudança"],
  "la-justicia": ["balance|truth|responsibility|cause and effect;injustice|dishonesty", "equilíbrio|verdade|responsabilidade|causa e efeito;injustiça|desonestidade"],
  "el-colgado": ["pause|surrender|new perspective|sacrifice;resistance|stagnation", "pausa|entrega|nova perspectiva|sacrifício;resistência|estagnação"],
  "la-muerte": ["transformation|ending|rebirth|transition;resisting change|stagnation", "transformação|fim|renascimento|transição;resistência à mudança|estagnação"],
  "la-templanza": ["balance|moderation|patience|harmony;excess|imbalance", "equilíbrio|moderação|paciência|harmonia;excesso|desequilíbrio"],
  "el-diablo": ["bondage|temptation|materialism|shadow;release|breaking chains", "amarras|tentação|materialismo|sombra;libertação|romper correntes"],
  "la-torre": ["upheaval|revelation|chaos|sudden change;averting disaster|fear of change", "ruptura|revelação|caos|mudança súbita;evitar o desastre|medo da mudança"],
  "la-estrella": ["hope|inspiration|renewal|faith;discouragement|lack of faith", "esperança|inspiração|renovação|fé;desânimo|falta de fé"],
  "la-luna": ["illusion|intuition|fear|subconscious;clarity|confusion lifting", "ilusão|intuição|medo|subconsciente;clareza|confusão que se dissipa"],
  "el-sol": ["joy|success|vitality|clarity;delayed success|excessive optimism", "alegria|sucesso|vitalidade|clareza;sucesso adiado|otimismo excessivo"],
  "el-juicio": ["rebirth|calling|evaluation|forgiveness;self-criticism|denial", "renascimento|chamado|avaliação|perdão;autocrítica|negação"],
  "el-mundo": ["completion|achievement|integration|journey;incompletion|delays", "conclusão|conquista|integração|viagem;incompleto|atrasos"],
  "as-de-bastos": ["inspiration|spark|potential|creative drive;delay|lack of motivation", "inspiração|faísca|potencial|impulso criativo;atraso|falta de motivação"],
  "dos-de-bastos": ["planning|vision|decision|expansion;fear of the unknown|poor planning", "planejamento|visão|decisão|expansão;medo do desconhecido|falta de planejamento"],
  "tres-de-bastos": ["expansion|foresight|trade|progress;obstacles|delays", "expansão|previsão|comércio|progresso;obstáculos|atrasos"],
  "cuatro-de-bastos": ["celebration|home|stability|community;instability|family conflict", "celebração|lar|estabilidade|comunidade;instabilidade|conflitos familiares"],
  "cinco-de-bastos": ["competition|conflict|rivalry|disagreement;avoiding conflict|agreement", "competição|conflito|rivalidade|desacordo;evitar o conflito|acordo"],
  "seis-de-bastos": ["victory|recognition|public success|confidence;ego|fall", "vitória|reconhecimento|sucesso público|confiança;ego|queda"],
  "siete-de-bastos": ["defense|perseverance|bravery|standing firm;exhaustion|giving up", "defesa|perseverança|coragem|posição firme;esgotamento|desistir"],
  "ocho-de-bastos": ["speed|news|movement|swift action;delays|frustration", "velocidade|notícias|movimento|ação rápida;atrasos|frustração"],
  "nueve-de-bastos": ["resilience|last test|vigilance|persistence;paranoia|exhaustion", "resiliência|última prova|vigilância|persistência;paranoia|esgotamento"],
  "diez-de-bastos": ["burden|responsibility|overwork|overwhelm;release|delegating", "fardo|responsabilidade|sobrecarga|exaustão;libertação|delegar"],
  "sota-de-bastos": ["enthusiasm|exploration|message|curiosity;immaturity|impatience", "entusiasmo|exploração|mensagem|curiosidade;imaturidade|impaciência"],
  "caballero-de-bastos": ["action|adventure|passion|impulsiveness;recklessness|frustration", "ação|aventura|paixão|impulsividade;temeridade|frustração"],
  "reina-de-bastos": ["confidence|charisma|independence|warmth;jealousy|demanding", "confiança|carisma|independência|calor;ciúme|exigência"],
  "rey-de-bastos": ["leadership|vision|entrepreneurship|honor;authoritarianism|impulsiveness", "liderança|visão|empreendedorismo|honra;autoritarismo|impulsividade"],
  "as-de-copas": ["new love|compassion|emotional opening|joy;repressed emotions|emptiness", "amor novo|compaixão|abertura emocional|alegria;repressão emocional|vazio"],
  "dos-de-copas": ["union|partnership|mutual attraction|harmony;imbalance|breakup", "união|parceria|atração mútua|harmonia;desequilíbrio|rompimento"],
  "tres-de-copas": ["celebration|friendship|community|shared joy;excess|isolation", "celebração|amizade|comunidade|alegria compartilhada;excessos|isolamento"],
  "cuatro-de-copas": ["apathy|contemplation|dissatisfaction|missed opportunity;new interest|leaving stagnation", "apatia|contemplação|insatisfação|oportunidade ignorada;novo interesse|sair da estagnação"],
  "cinco-de-copas": ["loss|grief|regret|sadness;acceptance|forgiveness", "perda|luto|arrependimento|tristeza;aceitação|perdão"],
  "seis-de-copas": ["nostalgia|childhood|innocence|memories;living in the past|immaturity", "nostalgia|infância|inocência|lembranças;viver no passado|imaturidade"],
  "siete-de-copas": ["illusions|choices|fantasy|confusion;clarity|decision", "ilusões|opções|fantasia|confusão;clareza|decisão"],
  "ocho-de-copas": ["walking away|search|leaving by choice|detachment;fear of leaving|clinging", "afastamento|busca|abandono voluntário|desapego;medo de partir|apego"],
  "nueve-de-copas": ["satisfaction|wish fulfilled|gratitude|wellbeing;complacency|vanity", "satisfação|desejo realizado|gratidão|bem-estar;complacência|vaidade"],
  "diez-de-copas": ["family harmony|happiness|emotional fulfillment|home;family conflict|broken home", "harmonia familiar|felicidade|plenitude emocional|lar;conflitos familiares|lar desfeito"],
  "sota-de-copas": ["emotional message|sensitivity|creativity|intuition;emotional immaturity|creative block", "mensagem emocional|sensibilidade|criatividade|intuição;imaturidade emocional|bloqueio criativo"],
  "caballero-de-copas": ["romance|proposal|idealism|charm;emotional manipulation|empty promises", "romance|proposta|idealismo|encanto;manipulação emocional|promessas vazias"],
  "reina-de-copas": ["compassion|intuition|care|emotional maturity;emotional dependence|insecurity", "compaixão|intuição|cuidado|maturidade emocional;dependência emocional|insegurança"],
  "rey-de-copas": ["emotional balance|diplomacy|generosity|wisdom;coldness|manipulation", "equilíbrio emocional|diplomacia|generosidade|sabedoria;frieza|manipulação"],
  "as-de-espadas": ["clarity|truth|breakthrough|decision;confusion|destructive ideas", "clareza|verdade|avanço mental|decisão;confusão|ideias destrutivas"],
  "dos-de-espadas": ["indecision|stalemate|tense balance|avoidance;decision made|confusion", "indecisão|bloqueio|equilíbrio tenso|evasão;decisão tomada|confusão"],
  "tres-de-espadas": ["heartache|breakup|betrayal|heartbreak;healing|forgiveness", "dor|rompimento|traição|desamor;cura|perdão"],
  "cuatro-de-espadas": ["rest|recovery|retreat|meditation;exhaustion|restlessness", "descanso|recuperação|retiro|meditação;esgotamento|inquietação"],
  "cinco-de-espadas": ["conflict|defeat|hollow victory|dishonor;reconciliation|letting go of conflict", "conflito|derrota|vitória vazia|desonra;reconciliação|soltar o conflito"],
  "seis-de-espadas": ["transition|journey|leaving behind|gradual relief;resistance|emotional baggage", "transição|viagem|deixar para trás|alívio gradual;resistência|bagagem emocional"],
  "siete-de-espadas": ["deception|strategy|stealth|evasion;confession|conscience", "engano|estratégia|sigilo|evasão;confissão|consciência"],
  "ocho-de-espadas": ["restriction|fear|mental prison|powerlessness;release|new perspective", "restrição|medo|prisão mental|impotência;libertação|nova perspectiva"],
  "nueve-de-espadas": ["anxiety|insomnia|guilt|worry;hope|asking for help", "ansiedade|insônia|culpa|preocupação;esperança|pedir ajuda"],
  "diez-de-espadas": ["painful ending|rock bottom|betrayal|closure;recovery|rebirth", "fim doloroso|fundo do poço|traição|encerramento;recuperação|renascimento"],
  "sota-de-espadas": ["curiosity|vigilance|new ideas|communication;gossip|careless words", "curiosidade|vigilância|ideias novas|comunicação;fofoca|impulsividade verbal"],
  "caballero-de-espadas": ["swift action|ambition|determination|bluntness;aggression|recklessness", "ação rápida|ambição|determinação|franqueza;agressividade|imprudência"],
  "reina-de-espadas": ["clarity|independence|honesty|discernment;coldness|bitterness", "clareza|independência|honestidade|discernimento;frieza|amargura"],
  "rey-de-espadas": ["intellectual authority|logic|truth|ethics;abuse of power|manipulation", "autoridade intelectual|lógica|verdade|ética;abuso de poder|manipulação"],
  "as-de-oros": ["material opportunity|prosperity|new beginning|seed;missed opportunity|poor planning", "oportunidade material|prosperidade|novo começo|semente;oportunidade perdida|mau planejamento"],
  "dos-de-oros": ["balance|adaptability|juggling|priorities;disorganization|overload", "equilíbrio|adaptabilidade|malabarismo|prioridades;desorganização|sobrecarga"],
  "tres-de-oros": ["teamwork|mastery|collaboration|recognition;lack of cooperation|mediocre work", "trabalho em equipe|maestria|colaboração|reconhecimento;falta de cooperação|trabalho medíocre"],
  "cuatro-de-oros": ["security|control|saving|possessiveness;generosity|letting go of control", "segurança|controle|poupança|possessividade;generosidade|soltar o controle"],
  "cinco-de-oros": ["lack|hardship|exclusion|material loss;recovery|help received", "carência|dificuldade|exclusão|perda material;recuperação|ajuda recebida"],
  "seis-de-oros": ["generosity|charity|balance|giving and receiving;debt|self-serving generosity", "generosidade|caridade|equilíbrio|dar e receber;dívida|generosidade interesseira"],
  "siete-de-oros": ["patience|assessment|long-term investment|harvest;impatience|fruitless effort", "paciência|avaliação|investimento a longo prazo|colheita;impaciência|esforço sem fruto"],
  "ocho-de-oros": ["dedication|learning|craft|refinement;perfectionism|repetitive work", "dedicação|aprendizado|ofício|aperfeiçoamento;perfeccionismo|trabalho repetitivo"],
  "nueve-de-oros": ["independence|abundance|luxury|self-sufficiency;dependence|overspending", "independência|abundância|luxo|autossuficiência;dependência|gastos excessivos"],
  "diez-de-oros": ["legacy|wealth|family|lasting stability;family disputes|financial loss", "legado|riqueza|família|estabilidade duradoura;disputas familiares|perda financeira"],
  "sota-de-oros": ["study|opportunity|ambition|practicality;procrastination|lack of progress", "estudo|oportunidade|ambição|praticidade;procrastinação|falta de progresso"],
  "caballero-de-oros": ["consistency|responsibility|routine|reliability;stagnation|boredom", "constância|responsabilidade|rotina|confiabilidade;estagnação|tédio"],
  "reina-de-oros": ["nurturing|prosperity|practicality|home;work-home imbalance|materialism", "nutrição|prosperidade|praticidade|lar;desequilíbrio trabalho-lar|materialismo"],
  "rey-de-oros": ["success|abundance|security|material leadership;greed|corruption", "sucesso|abundância|segurança|liderança material;ganância|corrupção"],
};

/** Nombre de la carta en el idioma. */
export function nombreCarta(c: CartaTarot, idioma: Idioma = "es") {
  if (idioma === "es") return c.nombre;
  if (c.arcano === "mayor") return MAYORES[c.id]?.[idioma] ?? c.nombre;
  const rango = RANGOS[c.numero]?.[idioma];
  const palo = c.palo ? PALOS[c.palo]?.[idioma] : undefined;
  if (!rango || !palo) return c.nombre;
  return idioma === "en" ? `${rango} of ${palo}` : `${rango} de ${palo}`;
}

/** Las palabras de las pistas: 4 de su luz y 2 de su sombra. */
export function palabrasCarta(c: CartaTarot, idioma: Idioma = "es"): { luz: string[]; sombra: string[] } {
  if (idioma !== "es") {
    const fila = PALABRAS[c.id]?.[idioma === "en" ? 0 : 1];
    if (fila) {
      const [luz, sombra] = fila.split(";");
      return { luz: luz.split("|"), sombra: sombra.split("|") };
    }
  }
  return { luz: c.palabrasClave.slice(0, 4), sombra: c.palabrasClaveInvertida.slice(0, 2) };
}
