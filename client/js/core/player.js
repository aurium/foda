game.player = {
  placeHeroes: function() {
    game.player.heroesDeck = game.deck.build({
      name: 'heroes',
      filter: game.player.picks,
      cb: function(deck) {
        deck.addClass('cemitery player').appendTo(game.states.table.player).hide();
        if (game.mode == 'library') {
          var card = deck.data('cards')[0];
          card.addClass('player').on('mousedown touchstart', game.card.select);
          card.place(game.map.toPosition(5, 4));
          card.on('action', game.library.action).on('death', game.library.action);
        } else {
          var x = 4;
          var y = 6;
          $.each(deck.data('cards'), function(i, card) {
            var p = game.player.picks.indexOf(card.data('hero'));
            card.addClass('player').on('mousedown touchstart', game.card.select);
            card.place(game.map.toPosition(x + p, y));
            if (game.mode == 'online')
              card.on('action', game.online.action);
            if (game.mode == 'tutorial')
              card.on('select', game.tutorial.selected);
          });
        }
      }
    });
  },
  buyCard: function() {
    var availableSkills = $('.table .player .skills.available .card'), card, heroid, hero, to, skillid;
    if (availableSkills.length < game.player.cardsPerTurn + 1) {
      $('.table .player .skills.cemitery .card').appendTo(game.player.skills.deck);
      availableSkills = $('.table .player .skills.available .card');
    }
    card = availableSkills.randomCard();
    if (card.data('hand') === game.data.ui.right) {
      if (game.player.skills.hand.children().length < game.maxSkillCards) {
        card.appendTo(game.player.skills.hand);
      }
    } else if (game.player.skills.sidehand.children().length < game.maxSkillCards) {
      card.appendTo(game.player.skills.sidehand);
    }
  },
  buyHand: function() {
    game.player.buyCreeps();
    if (game.player.turn > 1)
      game.player.buyCards(game.player.cardsPerTurn);
  },
  buyCreeps: function(force, catapultforce) {
    var ranged, melee, catapult;
    if (game.player.turn === game.creepTurn || force) {
      game.units.buy('player');
    }
    if (game.player.turn === game.catapultTurn || catapultforce) {
      game.units.buyCatapult('player');
    }
  },
  buyCards: function(n) {
    for (var i = 0; i < n; i++) {
      game.player.buyCard();
    }
  },
  move: function(event) {
    var spot = $(this);
    var card = game.selectedCard;
    var from = card.getPosition();
    var to = spot.getPosition();
    if (game.canPlay() && spot.hasClass('free') && from !== to && !card.hasClass('done')) {
      card.move(to);
      card.removeClass('draggable').addClass('done');
      if (game.mode == 'online')
        game.currentMoves.push('M:' + from + ':' + to);
    }
  },
  attack: function(event) {
    var target = $(this);
    var source = game.selectedCard;
    var from = source.getPosition();
    var to = target.getPosition();
    if (game.canPlay() && source.data('damage') && from !== to && !source.hasClass('done') && target.data('current hp')) {
      source.attack(target);
      source.addClass('done').removeClass('draggable');
      if (game.mode == 'online')
        game.currentMoves.push('A:' + from + ':' + to);
    }
  },
  passive: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var hero = skill.data('hero');
    var skillid = skill.data('skill');
    var to = target.getPosition();
    if (game.canPlay() && hero && skillid) {
      skill.passive(target);
      if (game.mode == 'online')
        game.currentMoves.push('P:' + to + ':' + skillid + ':' + hero);
      game.skill.animateCast(skill, target, event);
    }
  },
  toggle: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var hero = skill.data('hero');
    var skillid = skill.data('skill');
    var to = target.getPosition();
    if (game.canPlay() && hero && skillid) {
      skill.toggle(target);
      if (game.mode == 'online')
        game.currentMoves.push('T:' + to + ':' + skillid + ':' + hero);
      game.skill.animateCast(skill, target, event);
    }
  },
  cast: function(event) {
    var target = $(this);
    var skill = game.selectedCard;
    var source = $('.map .source');
    if (!source.length) source = target;
    var from = source.getPosition();
    var to = target.getPosition();
    var hero = skill.data('hero');
    var skillid = skill.data('skill');
    if (game.canPlay() && hero && skillid && from && to) {
      source.cast(skill, to);
      if (skill.data('type') == game.data.ui.summon) {
        target.addClass('done').removeClass('draggable');
      }
      if (game.mode == 'online')
        game.currentMoves.push('C:' + from + ':' + to + ':' + skillid + ':' + hero);
      game.skill.animateCast(skill, to, event);
    }
  },
  stopChanneling: function(card) {
    if (game.mode == 'online') {
      var to = card.getPosition();
      game.currentMoves.push('G:' + to);
    }
  },
  summonCreep: function(event) {
    var target = $(this);
    var to = target.getPosition();
    var creep = game.selectedCard.data('unit');
    if (game.canPlay()) {
      if (game.mode == 'online')
        game.currentMoves.push('S:' + to + ':' + creep);
      game.units.summonCreep(target, to, creep, event);
    }
  },
  discard: function(skill) {
    var hero = skill.data('hero');
    var skillid = skill.data('skill');
    game.currentMoves.push('D:' + skillid + ':' + hero);
    game.states.table.discard.attr('disabled', true);
    skill.addClass('slidedown');
    game.timeout(200, function() {
      this.removeClass('slidedown');
      this.discard();
    }.bind(skill));
  },
  cardsInHand: function() {
    return game.player.skills.hand.children().length;
  }
};
