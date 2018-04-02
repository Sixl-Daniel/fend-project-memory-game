/*
 * MODEL
 */

const model = {

    init: function () {
        console.log("model: init()");
        this.starsCurrent = this.starsStartValue;
        this.movesCurrent = this.movesStartValue;
    },
    starsStartValue: 3,
    movesStartValue: 0,
    starsCurrent: null,
    movesCurrent: null,
    cardClasses: ['fa-codepen', 'fa-stack-overflow', 'fa-slack-hash', 'fa-node-js', 'fa-vuejs', 'fa-docker', 'fa-github', 'fa-npm'],
    cardCompare: null

};

/*
 * CONTROLLER
 */

const controller = {

    init: function() {
        console.clear();
        model.init();
        view.init();
    },
    getCardClasses: function() {
        return model.cardClasses;
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
    getMoves: function() {
        return model.movesCurrent;
    },
    incrementMoves: function() {
        model.movesCurrent++;
        view.renderMoves();
    },
    resetMoves: function() {
        model.movesCurrent = model.movesStartValue;
        view.renderMoves();
    },
    resetBoard: function () {
        view.renderBoard();
    },
    resetGame: function() {
        this.resetMoves();
        this.resetStars();
        this.resetBoard();
    },
    checkCardMatching(cardType) {
        if (model.cardCompare) {
            if (model.cardCompare === cardType) {
                this.markMatchingCards(cardType)
            } else {
                this.returnCards(model.cardCompare, cardType)
            }
        } else {
            model.cardCompare = cardType;
        }
    },
    markMatchingCards(cardType) {
        console.log('Match! Two cards with number ' + cardType);
        model.cardCompare = null;
    },
    returnCards(olderCard,newerCard) {
        console.log('No Match: Card ' + olderCard + ' & Card ' + newerCard);
        model.cardCompare = null;
    },

};

/*
 * VIEW
 */

const view = {

    init: function () {

        console.log("view: init()");

        // store pointers to DOM elements

        this.starsEl = document.querySelector(".stars");
        this.movesEl = document.querySelector(".moves");
        this.restartEl = document.querySelector(".restart");
        this.deckEl = document.querySelector(".deck");

        // add event listeners

        this.restartEl.addEventListener('click', function () {
            controller.resetGame();
        });
        this.deckEl.addEventListener('click', cardClickEventHandler);

        // event handlers

        function cardClickEventHandler(e) {
            if (e.target.nodeName === 'LI') {
                let card = e.target;
                // open card if not already open
                if (!hasClass(card, 'open')) {
                    addClass(card, 'open');
                    let cardType = card.getAttribute('data-card');
                    controller.incrementMoves();
                    controller.checkCardMatching(cardType);
                }
            }
        };

        // start rendering

        this.renderAll();

    },

    renderAll: function () {
        this.renderMoves();
        this.renderStars();
        this.renderBoard();
    },

    renderMoves: function () {
        let moves = controller.getMoves();
        this.movesEl.textContent =
            moves === 0 ? 'No moves yet' :
            moves === 1 ? 'One move' : moves + ' moves'
    },

    renderStars: function () {
        addClass(this.starsEl, 'stars--count-' + controller.getStars());
    },

    renderBoard: function () {

        /* vars */

        let cardClasses = controller.getCardClasses(),
            cardListArray = [],
            cardListMarkupString = '';

        /* clear board */

        this.deckEl.innerHTML = '';
        
        /* create an array that holds all 16 cards with 2x8 icon classes */

        for (let cardSet = 1; cardSet < 3; cardSet++) {
            for (let cardNumber = 1; cardNumber < 9; cardNumber++) {
                const cardClass = cardClasses[cardNumber - 1];
                const newCardMarkup = `<li data-card="${cardNumber}" class="card card-set-${cardSet} card-number-${cardNumber}"><i class="fab ${cardClass}"></i></li>`;
                cardListArray.push(newCardMarkup);
            };
        };

        /* create a markup string from randomized card array and inject markup in page */

        shuffle(cardListArray);
        cardListArray.forEach(function (card) {
            cardListMarkupString += card;
        });
        this.deckEl.innerHTML = cardListMarkupString;

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
    if (el.classList)
        return el.classList.contains(className)
    else
        return !!el.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'))
}

function addClass(el, className) {
    if (el.classList)
        el.classList.add(className)
    else if (!hasClass(el, className)) el.className += " " + className
}

function removeClass(el, className) {
    if (el.classList)
        el.classList.remove(className)
    else if (hasClass(el, className)) {
        var reg = new RegExp('(\\s|^)' + className + '(\\s|$)')
        el.className = el.className.replace(reg, ' ')
    }
}