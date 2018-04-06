/*
 * MODEL
 */

const model = {

    init: function() {
        console.log("model: init()");
        this.starsCurrent = this.starsStartValue;
        this.movesCurrent = this.movesStartValue;
    },

    gameHasStarted: false,
    starsStartValue: 3,
    movesStartValue: 0,
    starsCurrent: null,
    movesCurrent: null,
    cardCompare: null,
    cards: [
        { type: 1, name: 'Codepen', class: 'fa-codepen' },
        { type: 2, name: 'Stack Overflow', class: 'fa-stack-overflow' },
        { type: 3, name: 'Slack', class: 'fa-slack-hash' },
        { type: 4, name: 'Node.js', class: 'fa-node-js' },
        { type: 5, name: 'Vue.js', class: 'fa-vuejs' },
        { type: 6, name: 'Docker', class: 'fa-docker' },
        { type: 7, name: 'GitHub', class: 'fa-github' },
        { type: 8, name: 'NPM', class: 'fa-npm' }
    ],
    matchedSets: 0,
    locked: false,
    maxMoves: 28,
    timeShowingCards: 1000

};

/*
 * CONTROLLER
 */

const controller = {

    init: function() {
        console.clear();
        model.init();
        view.init();
        this.lock();
    },

    startGame: function() {
        model.gameHasStarted = true;
        this.unlock();
        view.renderLocked();
        view.renderGameStatus();
        view.enableResetBtn();
        view.disableStartBtn();
        view.startTimer();
    },

    resetGame: function() {
        model.gameHasStarted = false;
        this.lock();
        this.resetMoves();
        this.resetMatchedSets();
        this.resetStars();
        this.resetBoard();
        view.renderLocked();
        view.renderGameStatus();
        view.disableResetBtn();
        view.enableStartBtn();
        view.resetTimer();
        view.stopTimer();
        view.renderClock();
        iziToast.info({
            title: 'Reset!',
            message: 'New game initialized.',
            timeout: 3000
        });
    },

    gameHasStarted: function() {
        return model.gameHasStarted;
    },

    isLocked: function(){
        return model.locked;
    },

    lock(){
        model.locked = true;
        view.renderLocked();
    },

    unlock() {
        model.locked = false;
        view.renderLocked();
    },

    getCardType: function(cardID) {
        return cardID.substring(cardID.length - 1);
    },

    getCardName: function(cardType) {
        return model.cards[cardType - 1].name;
    },

    getCards: function() {
        return model.cards;
    },

    getStars: function() {
        return model.starsCurrent;
    },

    setStars: function(stars) {
        model.starsCurrent = stars;
        view.renderStars();
    },

    resetStars: function() {
        model.starsCurrent = model.starsStartValue;
        view.renderStars();
    },

    checkStars: function() {
        let moves = this.getMoves();
        let stars = 
            moves > 24 ? 0 :
            moves > 18 ? 1 :
            moves > 12 ? 2 : 3;
        controller.setStars(stars);
    },

    getMoves: function() {
        return model.movesCurrent;
    },

    incrementMoves: function() {
        model.movesCurrent++;
        view.renderMoves();
        this.checkStars();
    },

    resetMoves: function() {
        model.movesCurrent = model.movesStartValue;
        view.renderMoves();
    },

    getMatchedSets: function() {
        return model.matchedSets;
    },

    incrementMatchedSets: function() {
        model.matchedSets++;
        view.renderMatchedSets();
    },

    resetMatchedSets: function() {
        model.matchedSets = 0;
        view.renderMatchedSets();
    },

    resetBoard: function() {
        view.renderBoard();
    },

    checkCardMatching(cardType, cardID) {
        if (model.cardCompare) {
            this.lock();
            let previousCardID = model.cardCompare;
            let previousCardType = this.getCardType(model.cardCompare);
            this.incrementMoves();
            if (previousCardType === cardType) {
                this.incrementMatchedSets();
                this.markMatchingCards(cardType);
            } else {
                this.returnCards(previousCardID, cardID);
            }
        } else {
            model.cardCompare = cardID;
        }
        this.checkVictory();
    },

    markMatchingCards(cardType) {
        let name = this.getCardName(cardType);
        iziToast.success({
            title: 'Match!',
            message: 'Move ' + this.getMoves() + ' — You matched two ' + name + ' cards.',
            timeout: 6000,
        });
        model.cardCompare = null;
        view.matchCards(cardType);
    },

    returnCards(earlierCardID, laterCardID) {
        let earlierCardType = this.getCardType(earlierCardID);
        let laterCardType = this.getCardType(laterCardID);
        let nameEarlierCard = this.getCardName(earlierCardType);
        let nameLaterCard = this.getCardName(laterCardType);
        iziToast.show({
            title: 'No match.',
            message: 'Move ' + this.getMoves() +' — ' + nameEarlierCard + ' and ' + nameLaterCard + ' do not match.',
            timeout: 3000,
        });
        model.cardCompare = null;
        setTimeout(function() {
            view.returnCards(earlierCardID, laterCardID);
        }, model.timeShowingCards);
    },

    checkVictory: function() {
        if (this.getMoves() >= model.maxMoves) {
            controller.lock();
            this.initFailure();
        } else if (this.getMatchedSets() >= 8) {
            controller.lock();
            this.initVictory();
        }
    },

    modalToast(title, message){
        iziToast.show({
            title: title,
            titleColor: '#f55d3e',
            message: message,
            position: 'center',
            timeout: false,
            layout: 2,
            overlay: true,
            balloon: true,
            progressBar: false,
            overlayClose: true,
            overlayColor: 'rgba(0, 0, 0, 0.8)',
            titleSize: '24px',
            titleLineHeight: '36px',
            messageSize: '18px',
            messageLineHeight: '24px',
            onClosing: function() {
                controller.resetGame();
            }
        });
    },

    initVictory: function() {
        let time = view.getTimer();
        view.stopTimer();
        view.audioVictory.play();
        let title = 'Victory!',
            message = `Yes, you did it. You won.<br>With a glorious rating of <b>${controller.getStars()} stars</b> and <b>${controller.getMoves()} moves</b>. You spent <b>${time.hours} hours</b>, <b>${time.minutes} minutes</b> and <b>${time.seconds} seconds</b>. Hooray.<br>Close dialog and press <b>Start</b> to play again.`;
        this.modalToast(title, message);
    },

    initFailure: function() {
        let time = view.getTimer();
        view.stopTimer();
        view.audioFailure.play();
        let title = 'Failure!',
            message = `Wow, this is unexpected. You lost.<br>It took you <b>${controller.getMoves()} moves</b> to match <b>${controller.getMatchedSets()} sets</b>. You spent <b>${time.hours} hours</b>, <b>${time.minutes} minutes</b> and <b>${time.seconds} seconds</b>.<br>Close dialog and press <b>Start</b> to try again.`;
        this.modalToast(title, message);
    }

};

/*
 * VIEW
 */

const view = {

    init: function() {

        console.log("view: init()");

        // store pointers to DOM elements

        this.starsEl = document.querySelector(".stars");
        this.movesEl = document.querySelector(".moves");
        this.matchedSetsEl = document.querySelector(".matched-sets");
        this.deckEl = document.querySelector(".deck");
        
        this.audioClick = document.querySelector("#audio-click");
        this.audioMatch = document.querySelector("#audio-match");
        this.audioVictory = document.querySelector("#audio-victory");
        this.audioFailure = document.querySelector("#audio-failure");
        this.timerSeconds = document.querySelector("#timer-seconds");
        this.btnStart = document.querySelector("#btn-start-game");
        this.btnReset = document.querySelector("#btn-reset-game");

        // instantiate Timer
        
        timer = new Timer();

        // add event listeners

        this.btnStart.addEventListener('click', startClickEventHandler);
        this.btnReset.addEventListener('click', resetClickEventHandler);
        this.deckEl.addEventListener('click', cardClickEventHandler);
        timer.addEventListener('secondsUpdated', function(e) {
            view.timerSeconds.innerHTML = timer.getTotalTimeValues().seconds;
        });

        // event handlers

        function cardClickEventHandler(e) {
            if (!controller.isLocked() && controller.gameHasStarted() && e.target.nodeName === 'LI') {
                view.audioClick.play();
                let card = e.target;
                // open card if not already open
                if (!hasClass(card, 'open')) {
                    addClass(card, 'open');
                    let cardID = card.id;
                    let cardType = cardID.substr(cardID.length - 1);
                    controller.checkCardMatching(cardType, cardID);
                }
            }
        };

        function startClickEventHandler() {
            controller.startGame();
        };

        function resetClickEventHandler() {
            controller.resetGame();
        };

        // start rendering

        this.renderAll();

    },

    renderAll: function() {
        this.renderMoves();
        this.renderMatchedSets();
        this.renderStars();
        this.renderBoard();
        this.renderGameStatus();
    },

    renderGameStatus: function() {
        if (!controller.gameHasStarted()) {
            if (!hasClass(document.body, 'game-off')) {
                addClass(document.body, 'game-off');
            }
        } else {
            if (hasClass(document.body, 'game-off')) {
                removeClass(document.body, 'game-off');
            }
        }
    },

    renderMoves: function() {
        let moves = controller.getMoves();
        this.movesEl.textContent =
            moves === 0 ? 'No moves yet' :
            moves === 1 ? 'One move' : moves + ' moves'
    },

    renderMatchedSets: function() {
        let matchedSets = controller.getMatchedSets();
        this.matchedSetsEl.textContent =
            matchedSets === 0 ? 'no matched sets yet' :
            matchedSets === 1 ? 'one matched set' : matchedSets + ' matched sets'
    },

    renderStars: function() {
        this.starsEl.className = 'stars stars--count-' + controller.getStars();
    },

    renderBoard: function() {

        /* vars */

        let cards = controller.getCards(),
            cardListArray = [],
            cardListMarkupString = '';

        /* clear board */

        this.deckEl.innerHTML = '';

        /* create an array that holds all 16 cards with 2x8 icon classes */
        
        for (let cardSet = 1; cardSet < 3; cardSet++) {
            for (let cardCount = 0; cardCount < cards.length; cardCount++) {
                let card = cards[cardCount];
                let newCardMarkup = `<li data-card="${card.type}" id="card-${cardSet}${card.type}" class="card card-set-${cardSet} card-number-${card.type}"><i class="fab ${card.class}"></i></li>`;
                cardListArray.push(newCardMarkup);
            };
        };
        
        /* create a markup string from randomized card array and inject markup in page */

        shuffle(cardListArray);
        cardListArray.forEach(function(card) {
            cardListMarkupString += card;
        });
        this.deckEl.innerHTML = cardListMarkupString;

    },

    renderLocked: function() {
        if (controller.isLocked()) {
            addClass(document.body, 'is-locked');
        } else {
            removeClass(document.body, 'is-locked');
        }
    },

    renderClock: function() {
        view.timerSeconds.innerHTML = timer.getTotalTimeValues().seconds;
    },

    matchCards: function(cardType) {
        view.audioMatch.play();
        let cards = document.querySelectorAll('.card-number-' + cardType);
        for (var i = 0; i < cards.length; i++) {
            addClass(cards[i], 'match');
        }
        controller.unlock();
    },

    returnCards: function(earlierCardID, laterCardID) {
        let card1 = document.getElementById(earlierCardID);
        let card2 = document.getElementById(laterCardID);
        removeClass(document.getElementById(earlierCardID), 'open');
        removeClass(document.getElementById(laterCardID), 'open');
        controller.unlock();
    },

    disableStartBtn: function() {
        this.btnStart.disabled = true;
    },

    enableStartBtn: function() {
        this.btnStart.disabled = false;
    },

    disableResetBtn: function() {
        this.btnReset.disabled = true;
    },

    enableResetBtn: function() {
        this.btnReset.disabled = false;
    },

    startTimer: function() {
        timer.start();
    },

    stopTimer: function() {
        timer.stop();
    },

    resetTimer: function() {
        timer.reset();
    },

    pauseTimer: function() {
        timer.pause();
    },

    getTimer: function() {
        let hours = timer.getTimeValues().hours;
        let minutes = timer.getTimeValues().minutes;
        let seconds = timer.getTimeValues().seconds;
        return {hours: hours, minutes: minutes, seconds: seconds};
    }

};

/*
 * RUN APPLICATION
 */

controller.init(); 

/*
 * HELPER FUNCTIONS
 */

// shuffle function from http://stackoverflow.com/a/2450976

function shuffle(array) {
    var currentIndex = array.length,
        temporaryValue, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;
        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }
    return array;
}

// class helpers from https://jaketrent.com/post/addremove-classes-raw-javascript/

function hasClass(el, className) {
    if (el.classList) {
        return el.classList.contains(className)
    } else {
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
    }
}

function addClass(el, className) {
    if (el.classList) {
        el.classList.add(className)
    } else if (!hasClass(el, className)) {
        el.className += " " + className
    }
}

function removeClass(el, className) {
    if (el.classList) {
        el.classList.remove(className)
    } else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}