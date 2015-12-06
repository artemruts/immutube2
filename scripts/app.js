/* global define */
define([
	  'jquery'
	, 'ramda'
	, 'pointfree'
	, 'Maybe'
	, 'player'
	, 'bacon'
	, 'io'
	, 'http'
], function ($, _, P, Maybe, Player, bacon, io, http) {
	'use strict';

	io.extendFn();

	// HELPERS ///////////////////////////////////////////////////////////////////////////
	var compose = P.compose,
		map = P.map,
		log = function (x) {
			console.log('LOG => ', x);
			return x;
		},
		fork = _.curry(function (f, future) {
			return future.fork(log, f);
		}),
		setHtml = _.curry(function (sel, x) {
			return $(sel).html(x);
		}),
		get = _.curry(function(prop, obj) {
			return obj[prop];
		});

	// PURE //////////////////////////////////////////////////////////////////////////////

	// Bacon listener `fromEventTarget` wrapper for currying, reverses order of arguments
	// TODO: try ramda.flip instead
	var listen = _.curry(function (type, elt) {
		return bacon.fromEventTarget(elt, type);
	});

	// getDom :: String -> IO Dom
	var getDom = $.toIO();

	// keypressStream :: Dom -> EventStream DomEvent
	var keypressStream = listen('keyup');

	// targetValue :: DomEvent -> String
	var targetValue = (compose(get('value'), get('target')));

	// valueStream :: keypressStream | EventStream DomEvent -> EventStream String
	var valueStream = compose(map(targetValue), keypressStream);

	// queryUrl :: Sting -> String (URL)
	var queryUrl = function (query) {
		return 'https://www.googleapis.com/youtube/v3/search?q=' +
			query + '&key=AIzaSyBaB4AWcaX1SriJXrSYCWIeWyWC-QGm-e8' +
			'&part=snippet&alt=json';
	};

	// urlStream :: valueStream | EventStream String -> EventStream String (URL)
	var urlStream = compose(map(queryUrl), valueStream);

	// searchStream :: String (URL) -> EventStream Future JSON
	var searchStream = compose(map(http.getJSON), urlStream);

	// createLi :: Object -> DomElement
	var createLi = function (i) {
		return $('<li/>', {'data-youtubeid': i.id.videoId, text: i.snippet.title});
	};

	// createLiFromItems :: Object -> [DomElement]
	var createLiFromItems = compose(map(createLi), get('items'));

	// liStream :: EventStream Future JSON -> EventStream Future [DomElement]
	var liStream = compose(map(map(createLiFromItems)), searchStream);

	// clickStream :: DomElement -> EventStream DomElement
	var clickStream = compose(map(get('target')), listen('click'));

	// getVideoId :: DomElement -> Maybe String
	var getVideoId = compose(Maybe, get('youtubeid'), get('dataset'));

	// initPlayer :: Maybe String -> Rendered player
	var initPlayer = compose(setHtml('#player'), Player.create);

	// IMPURE ////////////////////////////////////////////////////////////////////////////

	getDom('#search').map(liStream).runIO().onValue(fork(setHtml('#results')));
	clickStream(window.document).onValue(compose(map(initPlayer), getVideoId));

});
