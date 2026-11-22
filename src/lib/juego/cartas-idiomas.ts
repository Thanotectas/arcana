import type { CartaTarot } from "@/lib/tarot/deck";
import type { Idioma } from "@/lib/i18n/idiomas";

/**
 * Lo que el juego necesita de cada carta en inglés, portugués, francés y turco: el nombre tradicional y las palabras
 * de las pistas (4 de su luz y 2 de su sombra). En español se usa el mazo tal cual.
 */
type OtroIdioma = Exclude<Idioma, "es">;
const MAYORES: Record<string, Record<OtroIdioma, string>> = {
  "el-loco": { en: "The Fool", pt: "O Louco", fr: "Le Fou", tr: "Deli" },
  "el-mago": { en: "The Magician", pt: "O Mago", fr: "Le Magicien", tr: "Büyücü" },
  "la-sacerdotisa": { en: "The High Priestess", pt: "A Sacerdotisa", fr: "La Grande Prêtresse", tr: "Başrahibe" },
  "la-emperatriz": { en: "The Empress", pt: "A Imperatriz", fr: "L'Impératrice", tr: "İmparatoriçe" },
  "el-emperador": { en: "The Emperor", pt: "O Imperador", fr: "L'Empereur", tr: "İmparator" },
  "el-sumo-sacerdote": { en: "The Hierophant", pt: "O Hierofante", fr: "Le Hiérophante", tr: "Başrahip" },
  "los-enamorados": { en: "The Lovers", pt: "Os Enamorados", fr: "Les Amoureux", tr: "Aşıklar" },
  "el-carro": { en: "The Chariot", pt: "O Carro", fr: "Le Chariot", tr: "Savaş Arabası" },
  "la-fuerza": { en: "Strength", pt: "A Força", fr: "La Force", tr: "Güç" },
  "el-ermitano": { en: "The Hermit", pt: "O Eremita", fr: "L'Ermite", tr: "Ermiş" },
  "la-rueda-de-la-fortuna": { en: "Wheel of Fortune", pt: "A Roda da Fortuna", fr: "La Roue de Fortune", tr: "Kader Çarkı" },
  "la-justicia": { en: "Justice", pt: "A Justiça", fr: "La Justice", tr: "Adalet" },
  "el-colgado": { en: "The Hanged Man", pt: "O Enforcado", fr: "Le Pendu", tr: "Asılan Adam" },
  "la-muerte": { en: "Death", pt: "A Morte", fr: "La Mort", tr: "Ölüm" },
  "la-templanza": { en: "Temperance", pt: "A Temperança", fr: "La Tempérance", tr: "Denge" },
  "el-diablo": { en: "The Devil", pt: "O Diabo", fr: "Le Diable", tr: "Şeytan" },
  "la-torre": { en: "The Tower", pt: "A Torre", fr: "La Tour", tr: "Kule" },
  "la-estrella": { en: "The Star", pt: "A Estrela", fr: "L'Étoile", tr: "Yıldız" },
  "la-luna": { en: "The Moon", pt: "A Lua", fr: "La Lune", tr: "Ay" },
  "el-sol": { en: "The Sun", pt: "O Sol", fr: "Le Soleil", tr: "Güneş" },
  "el-juicio": { en: "Judgement", pt: "O Julgamento", fr: "Le Jugement", tr: "Mahkeme" },
  "el-mundo": { en: "The World", pt: "O Mundo", fr: "Le Monde", tr: "Dünya" },
};

/** En turco va el palo en singular delante del rango («Kupa Ası», «Kılıç Kraliçesi»). */
const PALOS: Record<string, Record<OtroIdioma, string>> = {
  bastos: { en: "Wands", pt: "Paus", fr: "Bâtons", tr: "Asa" },
  copas: { en: "Cups", pt: "Copas", fr: "Coupes", tr: "Kupa" },
  espadas: { en: "Swords", pt: "Espadas", fr: "Épées", tr: "Kılıç" },
  oros: { en: "Pentacles", pt: "Ouros", fr: "Deniers", tr: "Tılsım" },
};
const RANGOS: Record<number, Record<OtroIdioma, string>> = {
  1: { en: "Ace", pt: "Ás", fr: "As", tr: "Ası" },
  2: { en: "Two", pt: "Dois", fr: "Deux", tr: "İkilisi" },
  3: { en: "Three", pt: "Três", fr: "Trois", tr: "Üçlüsü" },
  4: { en: "Four", pt: "Quatro", fr: "Quatre", tr: "Dörtlüsü" },
  5: { en: "Five", pt: "Cinco", fr: "Cinq", tr: "Beşlisi" },
  6: { en: "Six", pt: "Seis", fr: "Six", tr: "Altılısı" },
  7: { en: "Seven", pt: "Sete", fr: "Sept", tr: "Yedilisi" },
  8: { en: "Eight", pt: "Oito", fr: "Huit", tr: "Sekizlisi" },
  9: { en: "Nine", pt: "Nove", fr: "Neuf", tr: "Dokuzlusu" },
  10: { en: "Ten", pt: "Dez", fr: "Dix", tr: "Onlusu" },
  11: { en: "Page", pt: "Valete", fr: "Valet", tr: "Prensi" },
  12: { en: "Knight", pt: "Cavaleiro", fr: "Cavalier", tr: "Şövalyesi" },
  13: { en: "Queen", pt: "Rainha", fr: "Reine", tr: "Kraliçesi" },
  14: { en: "King", pt: "Rei", fr: "Roi", tr: "Kralı" },
};

/** «luz1|luz2|luz3|luz4;sombra1|sombra2» por carta, en inglés, portugués, francés y turco (en ese orden). */
const COLUMNA: Record<OtroIdioma, number> = { en: 0, pt: 1, fr: 2, tr: 3 };
const PALABRAS: Record<string, [string, string, string, string]> = {
  "el-loco": ["beginnings|freedom|spontaneity|faith;recklessness|rashness", "começos|liberdade|espontaneidade|fé;imprudência|temeridade", "commencements|liberté|spontanéité|foi;imprudence|témérité", "başlangıçlar|özgürlük|doğallık|inanç;pervasızlık|düşüncesizlik"],
  "el-mago": ["willpower|skill|manifestation|resources;manipulation|deceit", "vontade|habilidade|manifestação|recursos;manipulação|engano", "volonté|habileté|manifestation|ressources;manipulation|tromperie", "irade|beceri|tezahür|kaynaklar;manipülasyon|aldatma"],
  "la-sacerdotisa": ["intuition|mystery|inner wisdom|silence;harmful secrets|disconnection", "intuição|mistério|sabedoria interior|silêncio;segredos nocivos|desconexão", "intuition|mystère|sagesse intérieure|silence;secrets nuisibles|déconnexion", "sezgi|gizem|içsel bilgelik|sessizlik;zararlı sırlar|kopukluk"],
  "la-emperatriz": ["abundance|fertility|creativity|nurturing;dependence|creative block", "abundância|fertilidade|criatividade|nutrição;dependência|bloqueio criativo", "abondance|fertilité|créativité|soin;dépendance|blocage créatif", "bolluk|bereket|yaratıcılık|şefkatli bakım;bağımlılık|yaratıcı tıkanıklık"],
  "el-emperador": ["authority|structure|stability|leadership;tyranny|rigidity", "autoridade|estrutura|estabilidade|liderança;tirania|rigidez", "autorité|structure|stabilité|leadership;tyrannie|rigidité", "otorite|yapı|istikrar|liderlik;zorbalık|katılık"],
  "el-sumo-sacerdote": ["tradition|teaching|institutions|beliefs;rebellion|dogmatism", "tradição|ensino|instituições|crenças;rebeldia|dogmatismo", "tradition|enseignement|institutions|croyances;rébellion|dogmatisme", "gelenek|öğreti|kurumlar|inançlar;isyan|dogmatizm"],
  "los-enamorados": ["union|choice|harmony|attraction;imbalance|indecision", "união|escolha|harmonia|atração;desequilíbrio|indecisão", "union|choix|harmonie|attirance;déséquilibre|indécision", "birliktelik|seçim|uyum|çekim;dengesizlik|kararsızlık"],
  "el-carro": ["victory|determination|control|progress;lack of direction|aggression", "vitória|determinação|controle|avanço;falta de direção|agressividade", "victoire|détermination|maîtrise|progression;manque de direction|agressivité", "zafer|kararlılık|kontrol|ilerleme;yön eksikliği|saldırganlık"],
  "la-fuerza": ["courage|patience|compassion|inner mastery;weakness|insecurity", "coragem|paciência|compaixão|domínio interior;fraqueza|insegurança", "courage|patience|compassion|maîtrise intérieure;faiblesse|insécurité", "cesaret|sabır|şefkat|içsel ustalık;zayıflık|güvensizlik"],
  "el-ermitano": ["introspection|search|solitude|wisdom;isolation|unwanted loneliness", "introspecção|busca|solidão|sabedoria;isolamento|solidão indesejada", "introspection|quête|solitude|sagesse;isolement|solitude subie", "içe bakış|arayış|yalnızlık|bilgelik;içe kapanma|istenmeyen yalnızlık"],
  "la-rueda-de-la-fortuna": ["change|cycles|destiny|luck;bad streak|resisting change", "mudança|ciclos|destino|sorte;má fase|resistência à mudança", "changement|cycles|destin|chance;mauvaise passe|résistance au changement", "değişim|döngüler|kader|şans;kötü dönem|değişime direnç"],
  "la-justicia": ["balance|truth|responsibility|cause and effect;injustice|dishonesty", "equilíbrio|verdade|responsabilidade|causa e efeito;injustiça|desonestidade", "équilibre|vérité|responsabilité|cause et effet;injustice|malhonnêteté", "denge|hakikat|sorumluluk|neden ve sonuç;adaletsizlik|samimiyetsizlik"],
  "el-colgado": ["pause|surrender|new perspective|sacrifice;resistance|stagnation", "pausa|entrega|nova perspectiva|sacrifício;resistência|estagnação", "pause|lâcher-prise|nouvelle perspective|sacrifice;résistance|stagnation", "duraklama|teslimiyet|yeni bakış açısı|fedakârlık;direnç|durgunluk"],
  "la-muerte": ["transformation|ending|rebirth|transition;resisting change|stagnation", "transformação|fim|renascimento|transição;resistência à mudança|estagnação", "transformation|fin|renaissance|transition;résistance au changement|stagnation", "dönüşüm|son|yeniden doğuş|geçiş;değişime direnç|durgunluk"],
  "la-templanza": ["balance|moderation|patience|harmony;excess|imbalance", "equilíbrio|moderação|paciência|harmonia;excesso|desequilíbrio", "équilibre|modération|patience|harmonie;excès|déséquilibre", "denge|ölçülülük|sabır|uyum;aşırılık|dengesizlik"],
  "el-diablo": ["bondage|temptation|materialism|shadow;release|breaking chains", "amarras|tentação|materialismo|sombra;libertação|romper correntes", "attachements|tentation|matérialisme|ombre;libération|briser les chaînes", "bağımlılık|ayartı|maddecilik|gölge;özgürleşme|zincirleri kırmak"],
  "la-torre": ["upheaval|revelation|chaos|sudden change;averting disaster|fear of change", "ruptura|revelação|caos|mudança súbita;evitar o desastre|medo da mudança", "bouleversement|révélation|chaos|changement soudain;éviter le désastre|peur du changement", "sarsıntı|aydınlanma|kaos|ani değişim;felaketi önlemek|değişim korkusu"],
  "la-estrella": ["hope|inspiration|renewal|faith;discouragement|lack of faith", "esperança|inspiração|renovação|fé;desânimo|falta de fé", "espoir|inspiration|renouveau|foi;découragement|manque de foi", "umut|ilham|yenilenme|inanç;cesaretsizlik|inanç eksikliği"],
  "la-luna": ["illusion|intuition|fear|subconscious;clarity|confusion lifting", "ilusão|intuição|medo|subconsciente;clareza|confusão que se dissipa", "illusion|intuition|peur|subconscient;clarté|confusion qui se dissipe", "yanılsama|sezgi|korku|bilinçaltı;netlik|dağılan kafa karışıklığı"],
  "el-sol": ["joy|success|vitality|clarity;delayed success|excessive optimism", "alegria|sucesso|vitalidade|clareza;sucesso adiado|otimismo excessivo", "joie|réussite|vitalité|clarté;réussite retardée|optimisme excessif", "neşe|başarı|canlılık|netlik;gecikmiş başarı|aşırı iyimserlik"],
  "el-juicio": ["rebirth|calling|evaluation|forgiveness;self-criticism|denial", "renascimento|chamado|avaliação|perdão;autocrítica|negação", "renaissance|appel|bilan|pardon;autocritique|déni", "yeniden doğuş|çağrı|değerlendirme|affetme;öz eleştiri|inkâr"],
  "el-mundo": ["completion|achievement|integration|journey;incompletion|delays", "conclusão|conquista|integração|viagem;incompleto|atrasos", "accomplissement|réussite|intégration|voyage;inachèvement|retards", "tamamlanma|başarı|bütünleşme|yolculuk;yarım kalmışlık|gecikmeler"],
  "as-de-bastos": ["inspiration|spark|potential|creative drive;delay|lack of motivation", "inspiração|faísca|potencial|impulso criativo;atraso|falta de motivação", "inspiration|étincelle|potentiel|élan créatif;retard|manque de motivation", "ilham|kıvılcım|potansiyel|yaratıcı dürtü;gecikme|motivasyon eksikliği"],
  "dos-de-bastos": ["planning|vision|decision|expansion;fear of the unknown|poor planning", "planejamento|visão|decisão|expansão;medo do desconhecido|falta de planejamento", "planification|vision|décision|expansion;peur de l'inconnu|mauvaise planification", "planlama|vizyon|karar|genişleme;bilinmeyen korkusu|kötü planlama"],
  "tres-de-bastos": ["expansion|foresight|trade|progress;obstacles|delays", "expansão|previsão|comércio|progresso;obstáculos|atrasos", "expansion|prévoyance|échanges|progrès;obstacles|retards", "genişleme|öngörü|ticaret|ilerleme;engeller|gecikmeler"],
  "cuatro-de-bastos": ["celebration|home|stability|community;instability|family conflict", "celebração|lar|estabilidade|comunidade;instabilidade|conflitos familiares", "célébration|foyer|stabilité|communauté;instabilité|conflit familial", "kutlama|yuva|istikrar|topluluk;istikrarsızlık|aile içi çatışma"],
  "cinco-de-bastos": ["competition|conflict|rivalry|disagreement;avoiding conflict|agreement", "competição|conflito|rivalidade|desacordo;evitar o conflito|acordo", "compétition|conflit|rivalité|désaccord;éviter le conflit|accord", "rekabet|çatışma|çekişme|anlaşmazlık;çatışmadan kaçınma|uzlaşma"],
  "seis-de-bastos": ["victory|recognition|public success|confidence;ego|fall", "vitória|reconhecimento|sucesso público|confiança;ego|queda", "victoire|reconnaissance|succès public|confiance;ego|chute", "zafer|takdir|görünür başarı|özgüven;ego|düşüş"],
  "siete-de-bastos": ["defense|perseverance|bravery|standing firm;exhaustion|giving up", "defesa|perseverança|coragem|posição firme;esgotamento|desistir", "défense|persévérance|bravoure|tenir bon;épuisement|abandon", "savunma|azim|yiğitlik|dimdik durmak;tükenmişlik|pes etmek"],
  "ocho-de-bastos": ["speed|news|movement|swift action;delays|frustration", "velocidade|notícias|movimento|ação rápida;atrasos|frustração", "rapidité|nouvelles|mouvement|action rapide;retards|frustration", "hız|haberler|hareket|hızlı eylem;gecikmeler|hayal kırıklığı"],
  "nueve-de-bastos": ["resilience|last test|vigilance|persistence;paranoia|exhaustion", "resiliência|última prova|vigilância|persistência;paranoia|esgotamento", "résilience|dernière épreuve|vigilance|ténacité;paranoïa|épuisement", "dayanıklılık|son sınav|tetikte olmak|ısrar;paranoya|tükenmişlik"],
  "diez-de-bastos": ["burden|responsibility|overwork|overwhelm;release|delegating", "fardo|responsabilidade|sobrecarga|exaustão;libertação|delegar", "fardeau|responsabilité|surmenage|accablement;libération|déléguer", "yük|sorumluluk|aşırı çalışma|bunalmışlık;rahatlama|görev paylaşmak"],
  "sota-de-bastos": ["enthusiasm|exploration|message|curiosity;immaturity|impatience", "entusiasmo|exploração|mensagem|curiosidade;imaturidade|impaciência", "enthousiasme|exploration|message|curiosité;immaturité|impatience", "coşku|keşif|mesaj|merak;olgunlaşmamışlık|sabırsızlık"],
  "caballero-de-bastos": ["action|adventure|passion|impulsiveness;recklessness|frustration", "ação|aventura|paixão|impulsividade;temeridade|frustração", "action|aventure|passion|impulsivité;imprudence|frustration", "eylem|macera|tutku|fevrilik;pervasızlık|hayal kırıklığı"],
  "reina-de-bastos": ["confidence|charisma|independence|warmth;jealousy|demanding", "confiança|carisma|independência|calor;ciúme|exigência", "assurance|charisme|indépendance|chaleur;jalousie|exigence", "özgüven|karizma|bağımsızlık|sıcaklık;kıskançlık|talepkârlık"],
  "rey-de-bastos": ["leadership|vision|entrepreneurship|honor;authoritarianism|impulsiveness", "liderança|visão|empreendedorismo|honra;autoritarismo|impulsividade", "leadership|vision|esprit d'entreprise|honneur;autoritarisme|impulsivité", "liderlik|vizyon|girişimcilik|onur;otoriterlik|fevrilik"],
  "as-de-copas": ["new love|compassion|emotional opening|joy;repressed emotions|emptiness", "amor novo|compaixão|abertura emocional|alegria;repressão emocional|vazio", "amour naissant|compassion|ouverture du cœur|joie;émotions refoulées|vide", "yeni aşk|şefkat|duygusal açılım|neşe;bastırılmış duygular|boşluk"],
  "dos-de-copas": ["union|partnership|mutual attraction|harmony;imbalance|breakup", "união|parceria|atração mútua|harmonia;desequilíbrio|rompimento", "union|partenariat|attirance mutuelle|harmonie;déséquilibre|rupture", "birliktelik|ortaklık|karşılıklı çekim|uyum;dengesizlik|ayrılık"],
  "tres-de-copas": ["celebration|friendship|community|shared joy;excess|isolation", "celebração|amizade|comunidade|alegria compartilhada;excessos|isolamento", "célébration|amitié|communauté|joie partagée;excès|isolement", "kutlama|dostluk|topluluk|paylaşılan neşe;aşırılık|yalnız kalmak"],
  "cuatro-de-copas": ["apathy|contemplation|dissatisfaction|missed opportunity;new interest|leaving stagnation", "apatia|contemplação|insatisfação|oportunidade ignorada;novo interesse|sair da estagnação", "apathie|contemplation|insatisfaction|occasion manquée;nouvel intérêt|sortir de la stagnation", "ilgisizlik|tefekkür|tatminsizlik|kaçırılan fırsat;yeni ilgi|durgunluktan çıkmak"],
  "cinco-de-copas": ["loss|grief|regret|sadness;acceptance|forgiveness", "perda|luto|arrependimento|tristeza;aceitação|perdão", "perte|chagrin|regret|tristesse;acceptation|pardon", "kayıp|yas|pişmanlık|hüzün;kabullenme|affetme"],
  "seis-de-copas": ["nostalgia|childhood|innocence|memories;living in the past|immaturity", "nostalgia|infância|inocência|lembranças;viver no passado|imaturidade", "nostalgie|enfance|innocence|souvenirs;vivre dans le passé|immaturité", "nostalji|çocukluk|masumiyet|anılar;geçmişte yaşamak|olgunlaşmamışlık"],
  "siete-de-copas": ["illusions|choices|fantasy|confusion;clarity|decision", "ilusões|opções|fantasia|confusão;clareza|decisão", "illusions|choix|rêverie|confusion;clarté|décision", "yanılsamalar|seçenekler|hayal|kafa karışıklığı;netlik|karar"],
  "ocho-de-copas": ["walking away|search|leaving by choice|detachment;fear of leaving|clinging", "afastamento|busca|abandono voluntário|desapego;medo de partir|apego", "s'éloigner|quête|départ choisi|détachement;peur de partir|attachement", "uzaklaşmak|arayış|isteyerek ayrılmak|bırakabilmek;gitme korkusu|tutunmak"],
  "nueve-de-copas": ["satisfaction|wish fulfilled|gratitude|wellbeing;complacency|vanity", "satisfação|desejo realizado|gratidão|bem-estar;complacência|vaidade", "satisfaction|vœu exaucé|gratitude|bien-être;complaisance|vanité", "memnuniyet|gerçekleşen dilek|minnettarlık|iyi oluş;rehavet|kibir"],
  "diez-de-copas": ["family harmony|happiness|emotional fulfillment|home;family conflict|broken home", "harmonia familiar|felicidade|plenitude emocional|lar;conflitos familiares|lar desfeito", "harmonie familiale|bonheur|plénitude émotionnelle|foyer;conflit familial|foyer brisé", "aile uyumu|mutluluk|duygusal doyum|yuva;aile içi çatışma|dağılan yuva"],
  "sota-de-copas": ["emotional message|sensitivity|creativity|intuition;emotional immaturity|creative block", "mensagem emocional|sensibilidade|criatividade|intuição;imaturidade emocional|bloqueio criativo", "message du cœur|sensibilité|créativité|intuition;immaturité émotionnelle|blocage créatif", "duygusal mesaj|duyarlılık|yaratıcılık|sezgi;duygusal olgunlaşmamışlık|yaratıcı tıkanıklık"],
  "caballero-de-copas": ["romance|proposal|idealism|charm;emotional manipulation|empty promises", "romance|proposta|idealismo|encanto;manipulação emocional|promessas vazias", "romance|proposition|idéalisme|charme;manipulation émotionnelle|promesses vides", "romantizm|teklif|idealizm|çekicilik;duygusal manipülasyon|boş vaatler"],
  "reina-de-copas": ["compassion|intuition|care|emotional maturity;emotional dependence|insecurity", "compaixão|intuição|cuidado|maturidade emocional;dependência emocional|insegurança", "compassion|intuition|bienveillance|maturité émotionnelle;dépendance affective|insécurité", "şefkat|sezgi|özen|duygusal olgunluk;duygusal bağımlılık|güvensizlik"],
  "rey-de-copas": ["emotional balance|diplomacy|generosity|wisdom;coldness|manipulation", "equilíbrio emocional|diplomacia|generosidade|sabedoria;frieza|manipulação", "équilibre émotionnel|diplomatie|générosité|sagesse;froideur|manipulation", "duygusal denge|diplomasi|cömertlik|bilgelik;soğukluk|manipülasyon"],
  "as-de-espadas": ["clarity|truth|breakthrough|decision;confusion|destructive ideas", "clareza|verdade|avanço mental|decisão;confusão|ideias destrutivas", "clarté|vérité|percée|décision;confusion|idées destructrices", "netlik|hakikat|zihinsel atılım|karar;kafa karışıklığı|yıkıcı fikirler"],
  "dos-de-espadas": ["indecision|stalemate|tense balance|avoidance;decision made|confusion", "indecisão|bloqueio|equilíbrio tenso|evasão;decisão tomada|confusão", "indécision|impasse|équilibre tendu|évitement;décision prise|confusion", "kararsızlık|çıkmaz|gergin denge|kaçınma;verilen karar|kafa karışıklığı"],
  "tres-de-espadas": ["heartache|breakup|betrayal|heartbreak;healing|forgiveness", "dor|rompimento|traição|desamor;cura|perdão", "peine de cœur|rupture|trahison|cœur brisé;guérison|pardon", "gönül yarası|ayrılık|ihanet|kalp kırıklığı;iyileşme|affetme"],
  "cuatro-de-espadas": ["rest|recovery|retreat|meditation;exhaustion|restlessness", "descanso|recuperação|retiro|meditação;esgotamento|inquietação", "repos|récupération|retraite|méditation;épuisement|agitation", "dinlenme|toparlanma|inziva|meditasyon;tükenmişlik|huzursuzluk"],
  "cinco-de-espadas": ["conflict|defeat|hollow victory|dishonor;reconciliation|letting go of conflict", "conflito|derrota|vitória vazia|desonra;reconciliação|soltar o conflito", "conflit|défaite|victoire amère|déshonneur;réconciliation|lâcher le conflit", "çatışma|yenilgi|boş zafer|onursuzluk;barışma|çatışmayı bırakmak"],
  "seis-de-espadas": ["transition|journey|leaving behind|gradual relief;resistance|emotional baggage", "transição|viagem|deixar para trás|alívio gradual;resistência|bagagem emocional", "transition|voyage|laisser derrière soi|soulagement progressif;résistance|bagage émotionnel", "geçiş|yolculuk|geride bırakmak|yavaş yavaş rahatlama;direnç|duygusal yük"],
  "siete-de-espadas": ["deception|strategy|stealth|evasion;confession|conscience", "engano|estratégia|sigilo|evasão;confissão|consciência", "ruse|stratégie|discrétion|esquive;aveu|conscience", "aldatma|strateji|gizlilik|kaçamak;itiraf|vicdan"],
  "ocho-de-espadas": ["restriction|fear|mental prison|powerlessness;release|new perspective", "restrição|medo|prisão mental|impotência;libertação|nova perspectiva", "restriction|peur|prison mentale|impuissance;libération|nouvelle perspective", "kısıtlama|korku|zihinsel hapis|çaresizlik;özgürleşme|yeni bakış açısı"],
  "nueve-de-espadas": ["anxiety|insomnia|guilt|worry;hope|asking for help", "ansiedade|insônia|culpa|preocupação;esperança|pedir ajuda", "anxiété|insomnie|culpabilité|inquiétude;espoir|demander de l'aide", "kaygı|uykusuzluk|suçluluk|endişe;umut|yardım istemek"],
  "diez-de-espadas": ["painful ending|rock bottom|betrayal|closure;recovery|rebirth", "fim doloroso|fundo do poço|traição|encerramento;recuperação|renascimento", "fin douloureuse|creux de la vague|trahison|clôture;rétablissement|renaissance", "acı bir son|dip noktası|ihanet|kapanış;toparlanma|yeniden doğuş"],
  "sota-de-espadas": ["curiosity|vigilance|new ideas|communication;gossip|careless words", "curiosidade|vigilância|ideias novas|comunicação;fofoca|impulsividade verbal", "curiosité|vigilance|idées neuves|communication;commérages|paroles irréfléchies", "merak|uyanıklık|yeni fikirler|iletişim;dedikodu|düşüncesiz sözler"],
  "caballero-de-espadas": ["swift action|ambition|determination|bluntness;aggression|recklessness", "ação rápida|ambição|determinação|franqueza;agressividade|imprudência", "action rapide|ambition|détermination|franchise;agressivité|imprudence", "hızlı eylem|hırs|kararlılık|dobralık;saldırganlık|pervasızlık"],
  "reina-de-espadas": ["clarity|independence|honesty|discernment;coldness|bitterness", "clareza|independência|honestidade|discernimento;frieza|amargura", "clarté|indépendance|honnêteté|discernement;froideur|amertume", "netlik|bağımsızlık|dürüstlük|sağduyu;soğukluk|kırgınlık"],
  "rey-de-espadas": ["intellectual authority|logic|truth|ethics;abuse of power|manipulation", "autoridade intelectual|lógica|verdade|ética;abuso de poder|manipulação", "autorité intellectuelle|logique|vérité|éthique;abus de pouvoir|manipulation", "entelektüel otorite|mantık|hakikat|etik;güç istismarı|manipülasyon"],
  "as-de-oros": ["material opportunity|prosperity|new beginning|seed;missed opportunity|poor planning", "oportunidade material|prosperidade|novo começo|semente;oportunidade perdida|mau planejamento", "opportunité matérielle|prospérité|nouveau départ|graine;occasion manquée|mauvaise planification", "maddi fırsat|refah|yeni başlangıç|tohum;kaçırılan fırsat|kötü planlama"],
  "dos-de-oros": ["balance|adaptability|juggling|priorities;disorganization|overload", "equilíbrio|adaptabilidade|malabarismo|prioridades;desorganização|sobrecarga", "équilibre|adaptabilité|jonglage|priorités;désorganisation|surcharge", "denge|uyum sağlama|hokkabazlık|öncelikler;dağınıklık|aşırı yük"],
  "tres-de-oros": ["teamwork|mastery|collaboration|recognition;lack of cooperation|mediocre work", "trabalho em equipe|maestria|colaboração|reconhecimento;falta de cooperação|trabalho medíocre", "travail d'équipe|maîtrise|collaboration|reconnaissance;manque de coopération|travail bâclé", "takım çalışması|ustalık|iş birliği|takdir;iş birliği eksikliği|özensiz iş"],
  "cuatro-de-oros": ["security|control|saving|possessiveness;generosity|letting go of control", "segurança|controle|poupança|possessividade;generosidade|soltar o controle", "sécurité|contrôle|épargne|possessivité;générosité|lâcher le contrôle", "güvence|kontrol|birikim|sahiplenicilik;cömertlik|kontrolü bırakmak"],
  "cinco-de-oros": ["lack|hardship|exclusion|material loss;recovery|help received", "carência|dificuldade|exclusão|perda material;recuperação|ajuda recebida", "manque|difficultés|exclusion|perte matérielle;rétablissement|aide reçue", "yoksunluk|zorluk|dışlanma|maddi kayıp;toparlanma|gelen yardım"],
  "seis-de-oros": ["generosity|charity|balance|giving and receiving;debt|self-serving generosity", "generosidade|caridade|equilíbrio|dar e receber;dívida|generosidade interesseira", "générosité|charité|équilibre|donner et recevoir;dette|générosité intéressée", "cömertlik|hayırseverlik|denge|vermek ve almak;borç|çıkarcı cömertlik"],
  "siete-de-oros": ["patience|assessment|long-term investment|harvest;impatience|fruitless effort", "paciência|avaliação|investimento a longo prazo|colheita;impaciência|esforço sem fruto", "patience|évaluation|investissement à long terme|récolte;impatience|effort sans fruit", "sabır|değerlendirme|uzun vadeli yatırım|hasat;sabırsızlık|sonuçsuz emek"],
  "ocho-de-oros": ["dedication|learning|craft|refinement;perfectionism|repetitive work", "dedicação|aprendizado|ofício|aperfeiçoamento;perfeccionismo|trabalho repetitivo", "dévouement|apprentissage|savoir-faire|perfectionnement;perfectionnisme|travail répétitif", "adanmışlık|öğrenme|zanaat|incelik;mükemmeliyetçilik|tekdüze iş"],
  "nueve-de-oros": ["independence|abundance|luxury|self-sufficiency;dependence|overspending", "independência|abundância|luxo|autossuficiência;dependência|gastos excessivos", "indépendance|abondance|luxe|autonomie;dépendance|dépenses excessives", "bağımsızlık|bolluk|lüks|kendine yetme;bağımlılık|aşırı harcama"],
  "diez-de-oros": ["legacy|wealth|family|lasting stability;family disputes|financial loss", "legado|riqueza|família|estabilidade duradoura;disputas familiares|perda financeira", "héritage|richesse|famille|stabilité durable;disputes familiales|perte financière", "miras|zenginlik|aile|kalıcı istikrar;aile anlaşmazlıkları|maddi kayıp"],
  "sota-de-oros": ["study|opportunity|ambition|practicality;procrastination|lack of progress", "estudo|oportunidade|ambição|praticidade;procrastinação|falta de progresso", "études|opportunité|ambition|sens pratique;procrastination|manque de progrès", "çalışma|fırsat|hırs|pratiklik;erteleme|ilerleme eksikliği"],
  "caballero-de-oros": ["consistency|responsibility|routine|reliability;stagnation|boredom", "constância|responsabilidade|rotina|confiabilidade;estagnação|tédio", "constance|responsabilité|routine|fiabilité;stagnation|ennui", "istikrar|sorumluluk|rutin|güvenilirlik;durgunluk|sıkılma"],
  "reina-de-oros": ["nurturing|prosperity|practicality|home;work-home imbalance|materialism", "nutrição|prosperidade|praticidade|lar;desequilíbrio trabalho-lar|materialismo", "soin|prospérité|sens pratique|foyer;déséquilibre travail-maison|matérialisme", "besleyicilik|refah|pratiklik|yuva;iş-ev dengesizliği|maddecilik"],
  "rey-de-oros": ["success|abundance|security|material leadership;greed|corruption", "sucesso|abundância|segurança|liderança material;ganância|corrupção", "réussite|abondance|sécurité|leadership matériel;avidité|corruption", "başarı|bolluk|güvence|maddi liderlik;açgözlülük|yozlaşma"],
};

/** Nombre de la carta en el idioma. */
export function nombreCarta(c: CartaTarot, idioma: Idioma = "es") {
  if (idioma === "es") return c.nombre;
  if (c.arcano === "mayor") return MAYORES[c.id]?.[idioma] ?? c.nombre;
  const rango = RANGOS[c.numero]?.[idioma];
  const palo = c.palo ? PALOS[c.palo]?.[idioma] : undefined;
  if (!rango || !palo) return c.nombre;
  if (idioma === "en") return `${rango} of ${palo}`;
  if (idioma === "tr") return `${palo} ${rango}`;
  // En francés, «d'» delante de vocal: «As d'Épées».
  if (idioma === "fr" && /^[AEIOUÉÈÊ]/i.test(palo)) return `${rango} d'${palo}`;
  return `${rango} de ${palo}`;
}

/** Las palabras de las pistas: 4 de su luz y 2 de su sombra. */
export function palabrasCarta(c: CartaTarot, idioma: Idioma = "es"): { luz: string[]; sombra: string[] } {
  if (idioma !== "es") {
    const fila = PALABRAS[c.id]?.[COLUMNA[idioma]];
    if (fila) {
      const [luz, sombra] = fila.split(";");
      return { luz: luz.split("|"), sombra: sombra.split("|") };
    }
  }
  return { luz: c.palabrasClave.slice(0, 4), sombra: c.palabrasClaveInvertida.slice(0, 2) };
}
