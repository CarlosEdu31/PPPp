// script.js

// Cartas com exposições e pontuações -3 a 3 (reclassificadas e comentadas)
const cards = [
    {
      name: "Praticar exercícios físicos",
      description: "Melhora sua saúde e resistência.",
      points: 3,
      explanation: "Exercícios físicos aumentam a imunidade e reduzem inflamações."
    },
    {
      name: "Alimentação balanceada",
      description: "Comer frutas, verduras e proteínas saudáveis.",
      points: 3,
      explanation: "Boa alimentação fornece nutrientes essenciais para o corpo."
    },
    {
      name: "Sono adequado",
      description: "Dormir de 7 a 9 horas por noite.",
      points: 3,
      explanation: "O sono recupera o corpo e regula hormônios importantes."
    },
    {
      name: "Contato com a natureza",
      description: "Estar ao ar livre regularmente.",
      points: 2,
      explanation: "Reduz estresse e melhora o humor, impactando positivamente a saúde."
    },
    {
      name: "Meditação e relaxamento",
      description: "Praticar técnicas para acalmar a mente.",
      points: 2,
      explanation: "Diminui a ansiedade e melhora o equilíbrio mental."
    },
    {
      name: "Vacinação em dia",
      description: "Protege contra doenças graves.",
      points: 3,
      explanation: "A vacinação previne doenças infecciosas, mantendo o corpo saudável."
    },
    {
      name: "Exposição excessiva ao sol",
      description: "Pode causar queimaduras e câncer de pele.",
      points: -3,
      explanation: "Exposição prolongada ao sol sem proteção danifica a pele e o DNA."
    },
    {
      name: "Consumo frequente de fast food",
      description: "Alimentos ricos em gordura e sódio.",
      points: -2,
      explanation: "Fast food aumenta risco de obesidade e doenças cardíacas."
    },
    {
      name: "Fumar cigarros",
      description: "Causa danos aos pulmões e outros órgãos.",
      points: -3,
      explanation: "O fumo é uma das maiores causas de doenças respiratórias e câncer."
    },
    {
      name: "Uso excessivo de eletrônicos",
      description: "Pode causar sedentarismo e problemas de visão.",
      points: -1,
      explanation: "Muito tempo na frente da tela prejudica o sono e o corpo."
    },
    {
      name: "Exposição a poluentes urbanos",
      description: "Ar contaminado prejudica os pulmões.",
      points: -2,
      explanation: "Poluição do ar aumenta risco de doenças respiratórias."
    },
    {
      name: "Consumo moderado de água",
      description: "Manter corpo hidratado.",
      points: 2,
      explanation: "A hidratação adequada ajuda no funcionamento do organismo."
    },
    {
      name: "Estresse constante",
      description: "Afeta o corpo e mente negativamente.",
      points: -2,
      explanation: "O estresse crônico prejudica o sistema imunológico."
    },
    {
      name: "Consumo excessivo de álcool",
      description: "Dano ao fígado e sistema nervoso.",
      points: -3,
      explanation: "Álcool em excesso causa várias doenças e prejuízos ao corpo."
    },
    {
      name: "Uso de máscara em ambientes fechados",
      description: "Previne doenças respiratórias.",
      points: 2,
      explanation: "Máscaras ajudam a bloquear vírus e bactérias."
    },
    {
      name: "Amizades positivas",
      description: "Apoio emocional e social.",
      points: 2,
      explanation: "Relacionamentos saudáveis melhoram o bem-estar mental."
    },
    {
      name: "Exposição a ambientes tóxicos no trabalho",
      description: "Produtos químicos prejudiciais.",
      points: -3,
      explanation: "Contato com toxinas pode causar doenças crônicas."
    },
    {
      name: "Higiene pessoal adequada",
      description: "Evita doenças infecciosas.",
      points: 3,
      explanation: "Manter higiene previne contaminações e infecções."
    },
    {
      name: "Sedentarismo",
      description: "Falta de atividade física.",
      points: -2,
      explanation: "Sedentarismo favorece obesidade e doenças cardíacas."
    },
    {
      name: "Consumo de alimentos orgânicos",
      description: "Menos agrotóxicos no corpo.",
      points: 2,
      explanation: "Alimentos orgânicos ajudam a reduzir exposição a toxinas."
    }
  ];
  
  // Variáveis do jogo
  let playerNames = ["Jogador 1", "Jogador 2"];
  let currentPlayer = 0; // 0 ou 1
  let roundsPerPlayer = 5;
  let currentRound = 1;
  
  let scores = [0, 0];
  let trails = [[], []]; // guarda os passos de cada jogador
  
  // Cartas sorteadas para rodadas já jogadas para evitar repetição
  let usedCardsPlayer = [new Set(), new Set()];
  
  // Estado para as opções atuais na rodada
  let currentOptions = [null, null];
  
  // DOM elements
  const startScreen = document.getElementById('start-screen');
  const gameScreen = document.getElementById('game-screen');
  const endScreen = document.getElementById('end-screen');
  
  const player1NameInput = document.getElementById('player1-name');
  const player2NameInput = document.getElementById('player2-name');
  const startBtn = document.getElementById('start-btn');
  
  const turnIndicator = document.getElementById('turn-indicator');
  const optionCards = [document.getElementById('option1'), document.getElementById('option2')];
  
  const explanationBox = document.getElementById('explanation-box');
  const explanationText = document.getElementById('explanation-text');
  
  const trailName1 = document.getElementById('trail-name-1');
  const trailName2 = document.getElementById('trail-name-2');
  const trail1 = document.getElementById('trail1');
  const trail2 = document.getElementById('trail2');
  
  const resultText = document.getElementById('result-text');
  const finalName1 = document.getElementById('final-name-1');
  const finalName2 = document.getElementById('final-name-2');
  const finalTrail1 = document.getElementById('final-trail-1');
  const finalTrail2 = document.getElementById('final-trail-2');
  
  // Função para iniciar o jogo
  startBtn.addEventListener('click', () => {
    const p1 = player1NameInput.value.trim();
    const p2 = player2NameInput.value.trim();
    if(p1 === "" || p2 === ""){
      alert("Por favor, digite os nomes dos dois jogadores.");
      return;
    }
    playerNames = [p1, p2];
    startScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
  
    trailName1.textContent = `${playerNames[0]} - Trilhas`;
    trailName2.textContent = `${playerNames[1]} - Trilhas`;
  
    finalName1.textContent = playerNames[0];
    finalName2.textContent = playerNames[1];
  
    updateTurnText();
    loadOptions();
  });
  
  // Atualiza o texto que indica o turno
  function updateTurnText(){
    turnIndicator.textContent = `Vez de: ${playerNames[currentPlayer]} (Rodada ${currentRound} de ${roundsPerPlayer})`;
  }
  
  // Gera duas opções (cartas) para o jogador atual
  function loadOptions(){
    explanationBox.classList.add('hidden');
  
    // Sorteia 2 cartas únicas e que não tenham sido usadas ainda pelo jogador atual
    let optionIndexes = [];
  
    while(optionIndexes.length < 2){
      const randIndex = Math.floor(Math.random() * cards.length);
      if(!usedCardsPlayer[currentPlayer].has(randIndex) && !optionIndexes.includes(randIndex)){
        optionIndexes.push(randIndex);
      }
    }
  
    currentOptions = optionIndexes;
  
    // Atualiza os textos das cartas
    for(let i=0; i<2; i++){
      const card = cards[optionIndexes[i]];
      optionCards[i].querySelector('.card-title').textContent = card.name;
      optionCards[i].querySelector('.card-description').textContent = card.description;
      optionCards[i].style.pointerEvents = 'auto';
      optionCards[i].style.opacity = 1;
    }
  }
  
  // Quando jogador escolhe uma das duas cartas
  function chooseOption(optionIndex){
    // Bloqueia clicar nas cartas enquanto exibe explicação
    optionCards[0].style.pointerEvents = 'none';
    optionCards[1].style.pointerEvents = 'none';
  
    // Marca a carta escolhida
    const chosenCard = cards[currentOptions[optionIndex]];
  
    // Atualiza pontuação e trilha do jogador atual
    scores[currentPlayer] += chosenCard.points;
    trails[currentPlayer].push(chosenCard);
  
    // Marca essa carta como usada pelo jogador
    usedCardsPlayer[currentPlayer].add(currentOptions[optionIndex]);
  
    // Exibe explicação da escolha
    explanationText.textContent = `Você escolheu: "${chosenCard.name}".\n${chosenCard.explanation}\nImpacto: ${chosenCard.points > 0 ? "+" : ""}${chosenCard.points} ponto(s).`;
    explanationBox.classList.remove('hidden');
  }
  
  // Passa para o próximo turno ou finaliza o jogo
  function nextTurn(){
    explanationBox.classList.add('hidden');
  
    // Atualiza rodada/turno
    if(currentPlayer === 1){
      currentRound++;
    }
    currentPlayer = (currentPlayer + 1) % 2;
  
    if(currentRound > roundsPerPlayer){
      endGame();
    } else {
      updateTurnText();
      updateTrails();
      loadOptions();
    }
  }
  
  // Atualiza as trilhas visuais para cada jogador
  function updateTrails(){
    // Limpa as trilhas atuais
    trail1.innerHTML = '';
    trail2.innerHTML = '';
  
    // Cria os elementos de passo para o jogador 1
    trails[0].forEach(card => {
      const step = document.createElement('div');
      step.classList.add('trail-step');
      step.textContent = card.points > 0 ? "+" + card.points : card.points;
      step.classList.add(getStepClass(card.points));
      step.title = `${card.name}: ${card.description}`;
      trail1.appendChild(step);
    });
  
    // Cria os elementos de passo para o jogador 2
    trails[1].forEach(card => {
      const step = document.createElement('div');
      step.classList.add('trail-step');
      step.textContent = card.points > 0 ? "+" + card.points : card.points;
      step.classList.add(getStepClass(card.points));
      step.title = `${card.name}: ${card.description}`;
      trail2.appendChild(step);
    });
  }
  
  // Define a cor do passo conforme o valor dos pontos
  function getStepClass(points){
    switch(points){
      case 3: return 'step-3';
      case 2: return 'step-2';
      case 1: return 'step-1';
      case 0: return 'step0';
      case -1: return 'step-1-neg';
      case -2: return 'step-2-neg';
      case -3: return 'step-3-neg';
      default: return 'step0';
    }
  }
  
  // Finaliza o jogo e mostra resultado
  function endGame(){
    gameScreen.classList.add('hidden');
    endScreen.classList.remove('hidden');
  
    // Exibe trilhas finais
    finalTrail1.innerHTML = '';
    finalTrail2.innerHTML = '';
  
    trails[0].forEach(card => {
      const step = document.createElement('div');
      step.classList.add('trail-step', getStepClass(card.points));
      step.textContent = card.points > 0 ? "+" + card.points : card.points;
      step.title = `${card.name}: ${card.description}`;
      finalTrail1.appendChild(step);
    });
  
    trails[1].forEach(card => {
      const step = document.createElement('div');
      step.classList.add('trail-step', getStepClass(card.points));
      step.textContent = card.points > 0 ? "+" + card.points : card.points;
      step.title = `${card.name}: ${card.description}`;
      finalTrail2.appendChild(step);
    });
  
    // Exibe resultado do jogo
    if(scores[0] > scores[1]){
      resultText.textContent = `${playerNames[0]} ganhou com ${scores[0]} pontos! 🎉`;
    } else if(scores[1] > scores[0]){
      resultText.textContent = `${playerNames[1]} ganhou com ${scores[1]} pontos! 🎉`;
    } else {
      resultText.textContent = `Empate! Ambos com ${scores[0]} pontos. 🤝`;
    }
  }
  