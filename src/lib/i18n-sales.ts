// Copy for the sales layer: break-even, cost of waiting, meeting mode, example case.

const en = {
  nav: { calculator: "Calculator", meeting: "Meeting mode", caseStudy: "60-second case", aria: "Main" },
  keypad: { aria: "Slot keypad", clear: "Clear", invalid: (code: string) => `No slot ${code}` },
  cta: { caseStudy: "See the 60-second case", meeting: "Run it in a client meeting" },
  insight: {
    breakEvenTitle: "What has to be true",
    needs: (pct: string) => `The readers pay back within 3 years if sales grow by only ${pct}.`,
    noGrowth: "The readers pay back within 3 years even if sales do not grow at all.",
    impossible: "At this margin and these fees, no sales increase pays the readers back.",
    versus: (label: string, pct: string) => `${label} estimate: ${pct}`,
    delayTitle: "The cost of waiting",
    delayChoose: "Choose how long the decision waits",
    months: (n: number) => `${n} months`,
    delayBody: (amount: string, n: number) => `Deciding ${n} months later gives up ${amount} in net gain.`,
    delayNone: "With these figures waiting costs nothing, because the readers do not earn a net gain yet.",
  },
  meeting: {
    metaTitle: "Meeting mode · Cashless Vending Payback",
    title: "Meeting mode",
    intro: "Run the conversation with the client step by step. Ask, listen, type in their answer. The business case builds itself.",
    stepLabel: (n: number, total: number) => `Step ${n} of ${total}`,
    stepsAria: "Meeting steps",
    ask: "Ask",
    why: "Why this question",
    back: "Back",
    next: "Next question",
    toClose: "See the result",
    live: "So far",
    openCalculator: "Open in the calculator",
    toProposal: "Turn this into a client proposal",
    steps: {
      site: {
        name: "Site",
        ask: "Where do your machines stand, and how many are there?",
        why: "The location shapes everything after it: who buys, when, and whether they carry cash. It also shows you are thinking about their site, not your product.",
      },
      sales: {
        name: "Sales",
        ask: "What does a typical machine sell on a normal day, and what do you keep after product cost?",
        why: "Only the margin counts as gain. Asking for it early keeps the business case honest, and the buyer sees that you will not sell them on revenue.",
      },
      cash: {
        name: "Cash",
        ask: "What does handling cash cost you today: collections, counting, topping up change?",
        why: "This cost is often invisible until someone asks. Saying it out loud gives the buyer a gain that does not depend on selling more.",
      },
      estimates: {
        name: "Estimates",
        ask: "How often do people walk away without cash? What would you call a cautious, a likely and a hopeful increase?",
        why: "Let the buyer name the numbers. They will defend their own estimate to their finance team; they will question yours.",
      },
      costs: {
        name: "Costs",
        ask: "Here is what the readers cost. Is there anything here you would want to check?",
        why: "Put the full cost on the table before the result. A number that appears later destroys the trust the rest of the meeting built.",
      },
      close: {
        name: "Result",
        ask: "Looking at your own figures, what would you need to see to try this on a few machines?",
        why: "Ask for a small next step, not the whole fleet. A pilot replaces the estimates with their own measured figures.",
      },
    },
    objectionsTitle: "If they push back",
    objectionsNote: "Example replies, built on the figures above. Say them your own way.",
    noCase: "With these figures the case does not hold. Say so, then look at the fees and the margin together. Being straight about it is worth more than this deal.",
    objections: {
      uplift: {
        q: "“I don't believe that sales increase.”",
        a: (needed: string, estimate: string) => `You don't have to believe my number. The readers pay back within 3 years at ${needed}, and your own realistic estimate is ${estimate}. A pilot measures the real one.`,
      },
      upfront: {
        q: "“That's too much money up front.”",
        a: (amount: string, payback: string) => `${amount} is the whole fleet at once, and on the realistic case it comes back in ${payback}. Starting with a handful of machines keeps the first step small.`,
      },
      fees: {
        q: "“Card fees will eat my margin.”",
        a: (fees: string, profit: string) => `On the realistic case the fees are ${fees} a month against ${profit} in extra gross profit. The net figure you see already has them taken off.`,
      },
      cash: {
        q: "“My customers pay cash.”",
        a: (share: string, net: string) => `Then keep cash: readers add a way to pay, they don't remove cash. On the conservative case, with ${share} paying by card, the net is ${net} a month. A pilot shows your real share.`,
      },
      later: {
        q: "“Let's look at this next year.”",
        a: (amount: string) => `That's your call. It is worth knowing what waiting costs: six months is ${amount} in net gain on the realistic case. A small pilot now keeps the decision open.`,
      },
    },
  },
  caseStudy: {
    metaTitle: "A 60-second case · Cashless Vending Payback",
    title: "One sales conversation, in 60 seconds",
    intro: "This is how the tool is meant to be used in front of a buyer. The client is an example and every figure is invented for it.",
    exampleTag: "Example case: invented figures",
    photoAlt: "Weight racks and colourful plates in a gym",
    steps: {
      problem: {
        title: "The problem, in the buyer's terms",
        body: (machines: number, sales: string) => `A gym chain runs ${machines} machines that only take cash, selling ${sales} a month. Members often train without a wallet. Nobody has measured the sales this loses.`,
        lesson: "Start from their fleet, not from the reader's features.",
      },
      numbers: {
        title: "Their numbers, three ways",
        body: "Nobody knows the increase before a pilot, so the buyer gives a cautious, a likely and a hopeful figure. Only the margin on extra sales counts as gain.",
        lesson: "Overstate the gain once and the finance team stops reading.",
      },
      objection: {
        title: "The objection",
        quote: "“I don't believe an 18% increase.”",
        body: (needed: string) => `No need to argue. The readers pay back within 3 years at ${needed}. The conversation moves from “is your number right?” to “could it really be lower than that?”.`,
        delay: (amount: string) => `And six months of waiting gives up ${amount} in net gain.`,
        lesson: "Don't defend the estimate. Show how little of it the case needs.",
      },
      close: {
        title: "A small next step",
        body: "One click turns this into a proposal the buyer can forward: every assumption listed, estimates marked as estimates. It asks for a pilot, not the whole fleet.",
        lesson: "Make it easy to say yes to the next step, and easy to explain internally.",
      },
    },
    openProposal: "Open this proposal",
    openCalculator: "Try your own figures",
    openMeeting: "See the meeting flow",
    whyTitle: "Why I built this",
    why: [
      "Buyers rarely decide on a feature list. They decide when they can defend the numbers to their own finance team.",
      "I have spent more than seven years in international B2B sales, so I built the tool I would want in that meeting, and one a sales team could pick up and use on Monday.",
    ],
  },
  email: {
    breakEven: (pct: string) => `The readers pay back within 3 years if sales grow by only ${pct}.`,
    noGrowth: "The readers pay back within 3 years even if sales do not grow at all.",
    delay: (amount: string) => `Waiting six months gives up ${amount} in net gain on the realistic case.`,
  },
  proposal: { title: "What has to be true" },
};

export type SalesCopy = typeof en;

const tr: SalesCopy = {
  nav: { calculator: "Hesaplayıcı", meeting: "Görüşme modu", caseStudy: "60 saniyelik vaka", aria: "Ana menü" },
  keypad: { aria: "Raf tuş takımı", clear: "Temizle", invalid: (code) => `${code} numaralı raf yok` },
  cta: { caseStudy: "60 saniyelik vakayı gör", meeting: "Müşteri görüşmesinde kullan" },
  insight: {
    breakEvenTitle: "Hangi koşul yeterli",
    needs: (pct) => `Satışlar yalnızca ${pct} artsa bile okuyucular 3 yıl içinde kendini amorti eder.`,
    noGrowth: "Satışlar hiç artmasa bile okuyucular 3 yıl içinde kendini amorti eder.",
    impossible: "Bu marj ve komisyonlarla hiçbir satış artışı okuyucuları amorti etmiyor.",
    versus: (label, pct) => `${label} tahmin: ${pct}`,
    delayTitle: "Beklemenin maliyeti",
    delayChoose: "Kararın ne kadar bekleyeceğini seçin",
    months: (n) => `${n} ay`,
    delayBody: (amount, n) => `Kararı ${n} ay ertelemek ${amount} net kazançtan vazgeçmek demek.`,
    delayNone: "Bu rakamlarla beklemenin maliyeti yok, çünkü okuyucular henüz net kazanç getirmiyor.",
  },
  meeting: {
    metaTitle: "Görüşme modu · Kartlı Otomat Geri Dönüş Hesabı",
    title: "Görüşme modu",
    intro: "Müşteriyle görüşmeyi adım adım yürütün. Sorun, dinleyin, cevabını yazın. İş gerekçesi kendiliğinden oluşur.",
    stepLabel: (n, total) => `Adım ${n} / ${total}`,
    stepsAria: "Görüşme adımları",
    ask: "Sorun",
    why: "Neden bu soru",
    back: "Geri",
    next: "Sonraki soru",
    toClose: "Sonucu gör",
    live: "Şu ana kadar",
    openCalculator: "Hesaplayıcıda aç",
    toProposal: "Bunu müşteri teklifine dönüştür",
    steps: {
      site: {
        name: "Lokasyon",
        ask: "Makineleriniz nerede duruyor, kaç tane var?",
        why: "Sonraki her şeyi lokasyon belirler: kim, ne zaman alıyor, üzerinde nakit var mı. Ürününüzü değil, onların lokasyonunu düşündüğünüzü de gösterir.",
      },
      sales: {
        name: "Satış",
        ask: "Sıradan bir günde bir makine ne kadar satıyor, ürün maliyetinden sonra elinizde ne kalıyor?",
        why: "Kazanç olarak yalnız marj sayılır. Bunu erken sormak iş gerekçesini dürüst tutar; alıcı da ciro üzerinden satış yapmayacağınızı görür.",
      },
      cash: {
        name: "Nakit",
        ask: "Nakit bugün size neye mal oluyor: para toplama, sayma, para üstü doldurma?",
        why: "Bu maliyet çoğu zaman biri sorana kadar görünmez. Yüksek sesle söylenince alıcı, daha fazla satışa bağlı olmayan bir kazanç görür.",
      },
      estimates: {
        name: "Tahminler",
        ask: "İnsanlar üzerinde nakit olmadığı için ne sıklıkla vazgeçiyor? Temkinli, olası ve iyimser artış size göre ne olur?",
        why: "Rakamları alıcı söylesin. Kendi tahminini finans ekibine karşı savunur; sizinkini sorgular.",
      },
      costs: {
        name: "Maliyet",
        ask: "Okuyucuların maliyeti bu. Kontrol etmek isteyeceğiniz bir şey var mı?",
        why: "Sonuçtan önce tüm maliyeti masaya koyun. Sonradan çıkan bir rakam, görüşmenin kurduğu güveni yıkar.",
      },
      close: {
        name: "Sonuç",
        ask: "Kendi rakamlarınıza bakınca, bunu birkaç makinede denemek için neyi görmeniz gerekir?",
        why: "Tüm filoyu değil, küçük bir sonraki adımı isteyin. Pilot, tahminlerin yerine onların ölçülmüş rakamlarını koyar.",
      },
    },
    objectionsTitle: "İtiraz gelirse",
    objectionsNote: "Yukarıdaki rakamlara dayanan örnek yanıtlar. Kendi cümlelerinizle söyleyin.",
    noCase: "Bu rakamlarla iş gerekçesi tutmuyor. Bunu açıkça söyleyin, sonra komisyon ve marja birlikte bakın. Dürüst olmak bu satıştan daha değerlidir.",
    objections: {
      uplift: {
        q: "“Bu satış artışına inanmıyorum.”",
        a: (needed, estimate) => `Benim rakamıma inanmanız gerekmiyor. Okuyucular ${needed} artışla 3 yıl içinde kendini amorti ediyor; sizin gerçekçi tahmininiz ise ${estimate}. Gerçek rakamı bir pilot ölçer.`,
      },
      upfront: {
        q: "“Peşin ödeme çok yüksek.”",
        a: (amount, payback) => `${amount} tüm filonun tek seferdeki bedeli ve gerçekçi senaryoda ${payback} içinde geri dönüyor. Birkaç makineyle başlamak ilk adımı küçük tutar.`,
      },
      fees: {
        q: "“Kart komisyonu marjımı yer.”",
        a: (fees, profit) => `Gerçekçi senaryoda komisyon ayda ${fees}, ek brüt kâr ise ${profit}. Gördüğünüz net rakamdan komisyon zaten düşülmüş durumda.`,
      },
      cash: {
        q: "“Müşterilerim nakit öder.”",
        a: (share, net) => `O zaman nakit de kalsın: okuyucu bir ödeme yolu ekler, nakdi kaldırmaz. Temkinli senaryoda, ${share} kartla ödeme ile net kazanç ayda ${net}. Gerçek payı bir pilot gösterir.`,
      },
      later: {
        q: "“Buna gelecek yıl bakalım.”",
        a: (amount) => `Karar sizin. Beklemenin maliyetini bilmekte fayda var: gerçekçi senaryoda altı ay, ${amount} net kazanç demek. Şimdi küçük bir pilot kararı açık tutar.`,
      },
    },
  },
  caseStudy: {
    metaTitle: "60 saniyelik vaka · Kartlı Otomat Geri Dönüş Hesabı",
    title: "60 saniyede bir satış görüşmesi",
    intro: "Araç, bir alıcının karşısında böyle kullanılmak üzere tasarlandı. Müşteri bir örnek ve tüm rakamlar bu örnek için uyduruldu.",
    exampleTag: "Örnek vaka: uydurma rakamlar",
    photoAlt: "Bir spor salonunda ağırlık rafları ve renkli plakalar",
    steps: {
      problem: {
        title: "Sorun, alıcının diliyle",
        body: (machines, sales) => `Bir spor salonu zinciri yalnız nakit alan ${machines} makine işletiyor ve ayda ${sales} satıyor. Üyeler çoğu zaman cüzdansız antrenman yapıyor. Bunun ne kadar satış kaybettirdiğini kimse ölçmemiş.`,
        lesson: "Okuyucunun özelliklerinden değil, onların filosundan başlayın.",
      },
      numbers: {
        title: "Onların rakamları, üç şekilde",
        body: "Pilottan önce artışı kimse bilemez, bu yüzden alıcı temkinli, olası ve iyimser bir rakam verir. Kazanç olarak yalnız ek satıştaki marj sayılır.",
        lesson: "Kazancı bir kez şişirirseniz finans ekibi okumayı bırakır.",
      },
      objection: {
        title: "İtiraz",
        quote: "“%18 artışa inanmıyorum.”",
        body: (needed) => `Tartışmaya gerek yok. Okuyucular ${needed} artışla 3 yıl içinde kendini amorti ediyor. Konuşma “rakamın doğru mu?” sorusundan “gerçekten bundan da düşük olabilir mi?” sorusuna geçiyor.`,
        delay: (amount) => `Üstelik altı ay beklemek ${amount} net kazançtan vazgeçmek demek.`,
        lesson: "Tahmini savunmayın. İş gerekçesinin ondan ne kadar azına ihtiyaç duyduğunu gösterin.",
      },
      close: {
        title: "Küçük bir sonraki adım",
        body: "Tek tıkla bu, alıcının iletebileceği bir teklife dönüşür: tüm varsayımlar listelenmiş, tahminler tahmin diye işaretlenmiştir. Tüm filoyu değil, bir pilot ister.",
        lesson: "Sonraki adıma evet demeyi ve bunu şirket içinde anlatmayı kolaylaştırın.",
      },
    },
    openProposal: "Bu teklifi aç",
    openCalculator: "Kendi rakamlarınızı deneyin",
    openMeeting: "Görüşme akışını görün",
    whyTitle: "Bunu neden yaptım",
    why: [
      "Alıcılar nadiren özellik listesine bakarak karar verir. Rakamları kendi finans ekiplerine karşı savunabildiklerinde karar verirler.",
      "Yedi yılı aşkın süredir uluslararası B2B satışta çalışıyorum. Bu yüzden o görüşmede elimde olmasını isteyeceğim aracı, bir satış ekibinin pazartesi günü alıp kullanabileceği şekilde yaptım.",
    ],
  },
  email: {
    breakEven: (pct) => `Satışlar yalnızca ${pct} artsa bile okuyucular 3 yıl içinde kendini amorti eder.`,
    noGrowth: "Satışlar hiç artmasa bile okuyucular 3 yıl içinde kendini amorti eder.",
    delay: (amount) => `Gerçekçi senaryoda altı ay beklemek ${amount} net kazançtan vazgeçmek demek.`,
  },
  proposal: { title: "Hangi koşul yeterli" },
};

const nl: SalesCopy = {
  nav: { calculator: "Calculator", meeting: "Gespreksmodus", caseStudy: "Case in 60 seconden", aria: "Hoofdmenu" },
  keypad: { aria: "Toetsenbord voor vakken", clear: "Wissen", invalid: (code) => `Vak ${code} bestaat niet` },
  cta: { caseStudy: "Bekijk de case in 60 seconden", meeting: "Gebruik in een klantgesprek" },
  insight: {
    breakEvenTitle: "Wat er waar moet zijn",
    needs: (pct) => `De terminals verdienen zich binnen 3 jaar terug als de omzet met slechts ${pct} groeit.`,
    noGrowth: "De terminals verdienen zich binnen 3 jaar terug, zelfs als de omzet niet groeit.",
    impossible: "Bij deze marge en kosten verdient geen enkele omzetgroei de terminals terug.",
    versus: (label, pct) => `Schatting ${label.toLocaleLowerCase("nl-NL")}: ${pct}`,
    delayTitle: "De kosten van wachten",
    delayChoose: "Kies hoe lang de beslissing wacht",
    months: (n) => `${n} maanden`,
    delayBody: (amount, n) => `${n} maanden later beslissen kost ${amount} aan nettowinst.`,
    delayNone: "Met deze cijfers kost wachten niets, omdat de terminals nog geen nettowinst opleveren.",
  },
  meeting: {
    metaTitle: "Gespreksmodus · Terugverdientijd Pinbetalen Automaten",
    title: "Gespreksmodus",
    intro: "Voer het gesprek met de klant stap voor stap. Vraag, luister, vul het antwoord in. De businesscase bouwt zichzelf op.",
    stepLabel: (n, total) => `Stap ${n} van ${total}`,
    stepsAria: "Stappen in het gesprek",
    ask: "Vraag",
    why: "Waarom deze vraag",
    back: "Terug",
    next: "Volgende vraag",
    toClose: "Bekijk de uitkomst",
    live: "Tot nu toe",
    openCalculator: "Openen in de calculator",
    toProposal: "Maak hier een klantvoorstel van",
    steps: {
      site: {
        name: "Locatie",
        ask: "Waar staan uw automaten en hoeveel zijn het er?",
        why: "De locatie bepaalt alles wat volgt: wie koopt, wanneer, en of ze contant geld bij zich hebben. Het laat ook zien dat u aan hun locatie denkt, niet aan uw product.",
      },
      sales: {
        name: "Omzet",
        ask: "Wat verkoopt een gemiddelde automaat op een normale dag, en wat houdt u over na inkoop?",
        why: "Alleen de marge telt als winst. Dit vroeg vragen houdt de businesscase eerlijk, en de koper ziet dat u niet op omzet verkoopt.",
      },
      cash: {
        name: "Contant",
        ask: "Wat kost contant geld u nu: lichten, tellen, wisselgeld bijvullen?",
        why: "Deze kosten blijven vaak onzichtbaar tot iemand ernaar vraagt. Hardop benoemd geven ze de koper een winst die niet afhangt van meer verkopen.",
      },
      estimates: {
        name: "Schattingen",
        ask: "Hoe vaak lopen mensen weg omdat ze geen contant geld hebben? Wat is voor u een voorzichtige, een waarschijnlijke en een hoopvolle groei?",
        why: "Laat de koper de cijfers noemen. Zijn eigen schatting verdedigt hij bij finance; die van u stelt hij ter discussie.",
      },
      costs: {
        name: "Kosten",
        ask: "Dit kosten de terminals. Is er iets wat u zou willen controleren?",
        why: "Leg de volledige kosten op tafel vóór de uitkomst. Een bedrag dat later opduikt, breekt het vertrouwen dat het gesprek heeft opgebouwd.",
      },
      close: {
        name: "Uitkomst",
        ask: "Als u naar uw eigen cijfers kijkt: wat zou u moeten zien om dit op een paar automaten te proberen?",
        why: "Vraag om een kleine volgende stap, niet om het hele park. Een pilot vervangt de schattingen door hun eigen gemeten cijfers.",
      },
    },
    objectionsTitle: "Als ze tegenwerpingen hebben",
    objectionsNote: "Voorbeeldantwoorden, gebaseerd op de cijfers hierboven. Zeg het op uw eigen manier.",
    noCase: "Met deze cijfers klopt de case niet. Zeg dat eerlijk en bekijk daarna samen de kosten en de marge. Eerlijkheid is meer waard dan deze deal.",
    objections: {
      uplift: {
        q: "“Ik geloof die omzetgroei niet.”",
        a: (needed, estimate) => `U hoeft mijn cijfer niet te geloven. De terminals verdienen zich binnen 3 jaar terug bij ${needed}, en uw eigen realistische schatting is ${estimate}. Een pilot meet het echte cijfer.`,
      },
      upfront: {
        q: "“Dat is te veel geld vooraf.”",
        a: (amount, payback) => `${amount} is het hele park in één keer, en in het realistische scenario komt dat terug in ${payback}. Beginnen met een handvol automaten houdt de eerste stap klein.`,
      },
      fees: {
        q: "“De transactiekosten eten mijn marge op.”",
        a: (fees, profit) => `In het realistische scenario zijn de kosten ${fees} per maand tegenover ${profit} extra brutowinst. Het nettocijfer dat u ziet, is daar al op gecorrigeerd.`,
      },
      cash: {
        q: "“Mijn klanten betalen contant.”",
        a: (share, net) => `Houd contant dan aan: terminals voegen een betaalwijze toe, ze halen contant geld niet weg. In het voorzichtige scenario, met ${share} pinbetalingen, is de nettowinst ${net} per maand. Een pilot toont uw echte aandeel.`,
      },
      later: {
        q: "“Laten we hier volgend jaar naar kijken.”",
        a: (amount) => `Dat is uw keuze. Het is goed om te weten wat wachten kost: zes maanden is ${amount} aan nettowinst in het realistische scenario. Een kleine pilot nu houdt de beslissing open.`,
      },
    },
  },
  caseStudy: {
    metaTitle: "Case in 60 seconden · Terugverdientijd Pinbetalen Automaten",
    title: "Eén verkoopgesprek in 60 seconden",
    intro: "Zo is de tool bedoeld tegenover een koper. De klant is een voorbeeld en alle cijfers zijn daarvoor verzonnen.",
    exampleTag: "Voorbeeldcase: verzonnen cijfers",
    photoAlt: "Gewichtenrekken en gekleurde schijven in een sportschool",
    steps: {
      problem: {
        title: "Het probleem, in de woorden van de koper",
        body: (machines, sales) => `Een sportschoolketen heeft ${machines} automaten die alleen contant geld accepteren en ${sales} per maand verkopen. Leden sporten vaak zonder portemonnee. Niemand heeft gemeten hoeveel omzet dit kost.`,
        lesson: "Begin bij hun automatenpark, niet bij de functies van de terminal.",
      },
      numbers: {
        title: "Hun cijfers, op drie manieren",
        body: "Niemand kent de groei vóór een pilot, dus de koper geeft een voorzichtig, een waarschijnlijk en een hoopvol cijfer. Alleen de marge op extra verkopen telt als winst.",
        lesson: "Overdrijf de winst één keer en finance leest niet verder.",
      },
      objection: {
        title: "De tegenwerping",
        quote: "“Ik geloof niet in 18% groei.”",
        body: (needed) => `Geen discussie nodig. De terminals verdienen zich binnen 3 jaar terug bij ${needed}. Het gesprek verschuift van “klopt uw cijfer?” naar “kan het echt nog lager zijn?”.`,
        delay: (amount) => `En zes maanden wachten kost ${amount} aan nettowinst.`,
        lesson: "Verdedig de schatting niet. Laat zien hoe weinig de case ervan nodig heeft.",
      },
      close: {
        title: "Een kleine volgende stap",
        body: "Met één klik wordt dit een voorstel dat de koper kan doorsturen: alle aannames op een rij, schattingen als schatting gemarkeerd. Het vraagt om een pilot, niet om het hele park.",
        lesson: "Maak ja zeggen tegen de volgende stap makkelijk, en intern uitleggen ook.",
      },
    },
    openProposal: "Open dit voorstel",
    openCalculator: "Probeer uw eigen cijfers",
    openMeeting: "Bekijk het gespreksverloop",
    whyTitle: "Waarom ik dit heb gemaakt",
    why: [
      "Kopers beslissen zelden op basis van een lijst met functies. Ze beslissen wanneer ze de cijfers bij hun eigen finance-team kunnen verdedigen.",
      "Ik werk al meer dan zeven jaar in internationale B2B-sales. Daarom heb ik de tool gemaakt die ik in dat gesprek zelf zou willen hebben, en die een salesteam maandag direct kan gebruiken.",
    ],
  },
  email: {
    breakEven: (pct) => `De terminals verdienen zich binnen 3 jaar terug als de omzet met slechts ${pct} groeit.`,
    noGrowth: "De terminals verdienen zich binnen 3 jaar terug, zelfs als de omzet niet groeit.",
    delay: (amount) => `Zes maanden wachten kost ${amount} aan nettowinst in het realistische scenario.`,
  },
  proposal: { title: "Wat er waar moet zijn" },
};

export const SALES = { en, tr, nl };
