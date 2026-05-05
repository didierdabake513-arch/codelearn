import { getCoursesList, saveCourse } from './db'

let seeded = false

export function seedIfEmpty() {
  if (seeded) return
  seeded = true
  const existing = getCoursesList()
  if (existing.length > 0) return

  // ── HTML ──────────────────────────────────────────────────────────────────
  saveCourse({
    id: 'html',
    icon: '🌐',
    name: 'HTML',
    desc: 'Structure et balises des pages web',
    level: 'debutant',
    cat: 'web',
    color: '#ff6b6b',
    bg: '#ff6b6b18',
    chapters: [
      {
        title: 'Les bases',
        lessons: [
          {
            title: 'Introduction à HTML',
            theory: `HTML signifie **HyperText Markup Language**. C'est le langage de base de toutes les pages web.\n\nTout document HTML commence par \`<!DOCTYPE html>\`. La balise \`<html>\` est la racine. Elle contient \`<head>\` pour les métadonnées et \`<body>\` pour le contenu visible.\n\n> Les balises vont par paires — une ouvrante \`<p>\` et une fermante \`</p>\`.`,
            task: 'Dans le \`<body>\`, écris un titre \`<h1>\` avec le texte **"Bonjour le monde !"** et un paragraphe \`<p>\` avec le texte **"J\'apprends HTML."**',
            starterCode: `<!DOCTYPE html>\n<html lang="fr">\n<head>\n  <title>Ma page</title>\n</head>\n<body>\n\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'La page contient un <h1>', check: 'hasTag', arg: 'h1' },
              { id: 't2', description: 'Le <h1> contient "Bonjour le monde !"', check: 'tagContainsText', arg: 'h1', text: 'Bonjour le monde !' },
              { id: 't3', description: 'La page contient un <p>', check: 'hasTag', arg: 'p' },
              { id: 't4', description: 'Le <p> contient "J\'apprends HTML"', check: 'tagContainsText', arg: 'p', text: "J'apprends HTML" },
            ],
          },
          {
            title: 'Les titres h1–h6',
            theory: `HTML propose 6 niveaux de titres, de \`<h1>\` à \`<h6>\`. \`<h1>\` est le plus important.\n\nChaque page devrait avoir **un seul** \`<h1>\` — c'est le titre principal.\n\n> Ne saute pas de niveaux : après \`h1\` vient \`h2\`, puis \`h3\`, etc.`,
            task: 'Crée une page avec un \`<h1>\`, un \`<h2>\` et un \`<h3>\` contenant chacun n\'importe quel texte.',
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'La page contient un <h1>', check: 'hasTag', arg: 'h1' },
              { id: 't2', description: 'La page contient un <h2>', check: 'hasTag', arg: 'h2' },
              { id: 't3', description: 'La page contient un <h3>', check: 'hasTag', arg: 'h3' },
            ],
          },
          {
            title: 'Liens et images',
            theory: `La balise \`<a href="...">\` crée un lien. L'attribut \`href\` définit la destination.\n\nLa balise \`<img src="..." alt="...">\` insère une image. L'attribut \`alt\` est **obligatoire** pour l'accessibilité.\n\n> Pour ouvrir un lien dans un nouvel onglet : ajoute \`target="_blank"\` sur la balise \`<a>\`.`,
            task: 'Ajoute un lien \`<a>\` vers n\'importe quelle URL **ET** une image \`<img>\` avec un attribut \`src\` et un attribut \`alt\`.',
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'La page contient un <a>', check: 'hasTag', arg: 'a' },
              { id: 't2', description: 'Le lien a un attribut href', check: 'hasAttr', tag: 'a', attr: 'href' },
              { id: 't3', description: 'La page contient une <img>', check: 'hasTag', arg: 'img' },
              { id: 't4', description: "L'image a un attribut alt", check: 'hasAttr', tag: 'img', attr: 'alt' },
            ],
          },
        ],
      },
      {
        title: 'Listes & tableaux',
        lessons: [
          {
            title: 'Listes ul et ol',
            theory: `\`<ul>\` crée une liste à **puces**. \`<ol>\` crée une liste **numérotée**. Les éléments sont dans des balises \`<li>\`.\n\n> Les listes peuvent être imbriquées : tu peux mettre un \`<ul>\` à l'intérieur d'un \`<li>\`.`,
            task: 'Crée une liste non ordonnée \`<ul>\` contenant **au moins 3** éléments \`<li>\`.',
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'La page contient un <ul>', check: 'hasTag', arg: 'ul' },
              { id: 't2', description: 'La liste contient au moins 3 <li>', check: 'minCount', tag: 'li', min: 3 },
            ],
          },
          {
            title: 'Tableaux HTML',
            theory: `Un tableau se construit avec \`<table>\`, des lignes \`<tr>\`, des en-têtes \`<th>\` et des cellules \`<td>\`.\n\nBonne pratique : utilise \`<thead>\` pour l'en-tête et \`<tbody>\` pour le corps.\n\n> Ajoute \`border="1"\` sur \`<table>\` pour voir les bordures sans CSS.`,
            task: 'Crée un tableau avec au moins **une ligne d\'en-tête** (\`<th>\`) et **deux lignes de données** (\`<tr>\` avec \`<td>\`).',
            starterCode: `<!DOCTYPE html>\n<html>\n<body>\n\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'La page contient un <table>', check: 'hasTag', arg: 'table' },
              { id: 't2', description: 'Le tableau contient des <th>', check: 'hasTag', arg: 'th' },
              { id: 't3', description: 'Le tableau contient au moins 2 lignes <tr>', check: 'minCount', tag: 'tr', min: 2 },
            ],
          },
        ],
      },
    ],
    quizzes: [
      { q: 'Quelle balise définit un titre de niveau 1 ?', opts: ['<title>', '<h1>', '<header>', '<heading>'], correct: 1, exp: "<h1> est le titre principal. <title> est le titre de l'onglet." },
      { q: 'Quelle balise crée un lien ?', opts: ['<link>', '<href>', '<a>', '<url>'], correct: 2, exp: 'La balise <a> avec href crée les liens.' },
      { q: 'Quelle balise insère une image ?', opts: ['<image>', '<img>', '<pic>', '<photo>'], correct: 1, exp: '<img src="..." alt="..."> insère une image.' },
      { q: 'Quelle balise crée une liste à puces ?', opts: ['<ol>', '<list>', '<ul>', '<li>'], correct: 2, exp: '<ul> = unordered list (puces). <ol> = ordered list (numérotée).' },
    ],
  })

  // ── CSS ───────────────────────────────────────────────────────────────────
  saveCourse({
    id: 'css',
    icon: '🎨',
    name: 'CSS',
    desc: 'Mise en forme, couleurs, layouts',
    level: 'debutant',
    cat: 'web',
    color: '#38bdf8',
    bg: '#38bdf818',
    chapters: [
      {
        title: 'Sélecteurs & propriétés',
        lessons: [
          {
            title: 'Premiers styles',
            theory: `CSS contrôle l'apparence des éléments HTML. La syntaxe : \`selecteur { propriete: valeur; }\`\n\n- **Balise** : \`h1 { color: red; }\`\n- **Classe** : \`.monStyle { ... }\` — préfixé par \`.\`\n- **ID** : \`#monId { ... }\` — préfixé par \`#\`\n\n> Le CSS se place dans une balise \`<style>\` dans le \`<head>\`.`,
            task: 'Dans le \`<style>\`, change la couleur du \`<h1>\` en bleu (\`color: blue\`) et la couleur de fond du \`body\` en \`#f0f0f0\`.',
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n\n</style>\n</head>\n<body>\n  <h1>Titre stylisé</h1>\n  <p>Un paragraphe</p>\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'Le CSS cible h1 avec color', check: 'cssContains', text: 'color' },
              { id: 't2', description: 'Le CSS contient background ou background-color', check: 'cssContains', text: 'background' },
            ],
          },
          {
            title: 'Box Model',
            theory: `Chaque élément est une boîte : **content** → **padding** → **border** → **margin**.\n\n- \`padding\` : espace intérieur (entre le contenu et la bordure)\n- \`margin\` : espace extérieur (entre les éléments)\n- \`border\` : la bordure\n\n> Toujours ajouter \`* { box-sizing: border-box; }\` — ça rend le calcul des tailles beaucoup plus intuitif.`,
            task: 'Crée une \`<div class="box">\` et dans le \`<style>\`, donne-lui un \`padding\` de 20px, une \`border\` de 2px solid et un \`margin\` de 10px.',
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  * { box-sizing: border-box; }\n\n</style>\n</head>\n<body>\n  <div class="box">Ma boîte</div>\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'Le CSS cible .box', check: 'cssContains', text: '.box' },
              { id: 't2', description: 'La .box a un padding', check: 'cssContains', text: 'padding' },
              { id: 't3', description: 'La .box a une border', check: 'cssContains', text: 'border' },
            ],
          },
          {
            title: 'Flexbox',
            theory: `Flexbox est le système de layout 1D de CSS. Il suffit d'ajouter \`display: flex\` au conteneur parent.\n\n- \`justify-content\` : alignement horizontal (axe principal)\n- \`align-items\` : alignement vertical (axe croisé)\n- \`gap\` : espace entre les éléments\n\n> Centrer parfaitement : \`display: flex; justify-content: center; align-items: center;\``,
            task: 'Crée un \`<div class="container">\` avec \`display: flex\` et \`justify-content: center\`. Mets 3 \`<div class="item">\` à l\'intérieur.',
            starterCode: `<!DOCTYPE html>\n<html>\n<head>\n<style>\n  .container {\n\n  }\n  .item {\n    background: #6c5ce7;\n    color: white;\n    padding: 12px 20px;\n    border-radius: 6px;\n  }\n</style>\n</head>\n<body>\n  <div class="container">\n    <div class="item">1</div>\n    <div class="item">2</div>\n    <div class="item">3</div>\n  </div>\n</body>\n</html>`,
            tests: [
              { id: 't1', description: 'Le CSS contient display: flex', check: 'cssContains', text: 'display: flex' },
              { id: 't2', description: 'Le CSS contient justify-content', check: 'cssContains', text: 'justify-content' },
            ],
          },
        ],
      },
    ],
    quizzes: [
      { q: 'Quel sélecteur cible class="btn" ?', opts: ['#btn', '.btn', 'btn', '*btn'], correct: 1, exp: 'Le sélecteur de classe utilise un point (.).' },
      { q: 'Quelle propriété change la couleur de fond ?', opts: ['color', 'background-color', 'bg', 'fill'], correct: 1, exp: 'background-color change le fond. color change le texte.' },
      { q: 'Quelle valeur active Flexbox ?', opts: ['display: block', 'display: flex', 'display: grid', 'flex: true'], correct: 1, exp: 'display: flex active flexbox sur le conteneur.' },
    ],
  })

  // ── JAVASCRIPT ────────────────────────────────────────────────────────────
  saveCourse({
    id: 'javascript',
    icon: '⚡',
    name: 'JavaScript',
    desc: 'Variables, fonctions, DOM, événements',
    level: 'intermediaire',
    cat: 'web',
    color: '#f5a524',
    bg: '#f5a52418',
    chapters: [
      {
        title: 'Les bases',
        lessons: [
          {
            title: 'Variables et types',
            theory: `En JavaScript, on déclare avec \`const\` (valeur fixe) ou \`let\` (modifiable).\n\n**Types primitifs :** \`string\`, \`number\`, \`boolean\`, \`null\`, \`undefined\`.\n\n**Template literals :** \`\\\`Bonjour \${nom}\\\`\` — plus lisible que la concaténation avec \`+\`.\n\n> Préfère toujours \`const\` par défaut, \`let\` seulement si tu dois réassigner.`,
            task: 'Déclare \`const nom\` avec ton prénom et \`const age\` avec un nombre. Puis affiche avec \`console.log\` : **"Bonjour, je m\'appelle [nom] et j\'ai [age] ans."** en utilisant un template literal.',
            starterCode: `// Déclare tes variables ici\n\n\n// Affiche le message\n`,
            tests: [
              { id: 't1', description: 'Le code contient const nom', check: 'codeContains', text: 'const nom' },
              { id: 't2', description: 'Le code contient const age', check: 'codeContains', text: 'const age' },
              { id: 't3', description: 'Le code appelle console.log', check: 'codeContains', text: 'console.log' },
              { id: 't4', description: 'Le code utilise un template literal', check: 'codeContains', text: '`' },
            ],
          },
          {
            title: 'Fonctions',
            theory: `Une fonction regroupe du code réutilisable.\n\n\`\`\`\nfunction saluer(nom) { return "Bonjour " + nom; }\nconst doubler = (n) => n * 2; // arrow function\n\`\`\`\n\n> Préfère les **arrow functions** (\`=>\`) en JavaScript moderne — elles sont plus concises.`,
            task: 'Écris une arrow function \`const additionner = (a, b) => ...\` qui retourne \`a + b\`. Appelle-la avec deux nombres et affiche le résultat avec \`console.log\`.',
            starterCode: `// Écris ta fonction additionner\n\n\n// Appelle-la et affiche le résultat\n`,
            tests: [
              { id: 't1', description: 'Le code définit additionner', check: 'codeContains', text: 'additionner' },
              { id: 't2', description: 'Le code utilise une arrow function =>', check: 'codeContains', text: '=>' },
              { id: 't3', description: 'Le code appelle console.log', check: 'codeContains', text: 'console.log' },
            ],
          },
        ],
      },
    ],
    quizzes: [
      { q: 'Quel mot-clé déclare une constante ?', opts: ['var', 'let', 'const', 'fix'], correct: 2, exp: 'const déclare une valeur non réassignable.' },
      { q: 'Quelle syntaxe est une arrow function valide ?', opts: ['function => x*2', 'const f = (x) => x*2', 'arrow(x) { x*2 }', 'fn x -> x*2'], correct: 1, exp: 'const f = (x) => x*2 est la syntaxe correcte.' },
    ],
  })
}
