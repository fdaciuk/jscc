/**
 * http://kangax.github.io/compat-table/es5/# for ECMAScript5 features
 */
(function(root, factory) {
	'use strict';

	if (typeof define === 'function' && define.amd) {
		// AMD
		define(['Ajax', 'Intermediary'], factory);
	} else if (typeof exports === 'object') {
		module.exports = factory(require('Ajax', 'Intermediary'));
	} else {
		root.DataStore = factory(root.Ajax, root.Intermediary);
	}
}(this, function(Ajax, Intermediary) {
	'use strict';

	var _agents,
	    _features,
	    _caseCount,
	    _attempts = 0,
	    _isReady = false,
	    _rules = {
		    queryselector             : [/\.querySelector\s*(?:All)*\(/],
		    getelementsbyclassname    : [/\.getElementsByClassName\s*\(/],
		    webworkers                : [/new\s*Worker\s*\(/],
		    hashchange                : [/(\.onhashchange\s*=|\.addEventListener\s*\(\s*(\'|")hashchange(\'|"))/],
		    sharedworkers             : [/new\s*SharedWorker\s*\(/],
		    canvas                    : [/\.getContext\s*\(\s*(?:\'|")2d(?:\'|")\s*\)/],
		    'canvas-text'             : [/\.(?:strokeText\s*\(|fillText\s*\(|measureText\s*\()/],
		    'namevalue-storage'       : [/(?:localStorage|sessionStorage)\./],
		    'sql-storage'             : [/=\s(?:.*?)openDatabase\s*\(/],
		    indexeddb                 : [/=\s(?:.*?)indexedDB/],
		    eventsource               : [/=\s*new\s*EventSource\s*\(/],
		    'x-doc-messaging'         : [/(\.addEventListener\s*\(\s*(?:\'|")message(?:\'|")|\.postMessage\s*\()/],
		    geolocation               : [/navigator\.geolocation/],
		    webgl                     : [/=\s*initWebGL\(/],
		    shadowdom                 : [/\.createShadowRoot\s*\(\s*\)/],
		    websockets                : [/=\s*new\s*WebSocket\s*\(\s*\)/],
		    'script-async'            : [/<\s*script\s*.*async.*?>/],
		    cors                      : [/\.withCredentials\s*=\s*(\'|")?true(\'|")?/],
		    json                      : [/JSON\.(?:parse|stringify)\s*\(/],
		    classlist                 : [/\.classList\.(remove|add|toggle|contains)\s*\(/],
		    notifications             : [/=\s*new\s*Notification\s*\(/],
		    stream                    : [/\.getUserMedia\s*\(/],
		    touch                     : [/\.addEventListener\s*\(\s*(?:\'|")touch(?:start|end|move|cancel)(?:\'|")/],
		    matchesselector           : [/\.matches(Selector)?\s*\(\s*(?:\'|").*?\s*(?:\'|")\s*\)/],
		    blobbuilder               : [/(window\.(?:Moz|WebKit)?BlobBuilder|=\s*new\s*Blob\()/],
		    createObjectURL           : [/\.createObjectURL\s*\(/],
		    rellist                   : [/\.relList/],
		    typedarrays               : [/=\s*new\s*((?:(?:Ui|I)nt)|Float)(?:8|16|32|64)?(?:Clamped)?Array\s*\(/],
		    deviceorientation         : [/\.DeviceOrientationEvent\s*\)|\.addEventListener\s*\(\s*(\'|")deviceorientation(\'|")\s*,/],
		    'script-defer'            : [/<\s*script\s*.*defer.*?>/],
		    'nav-timing'              : [/performance\.(?:timing|navigation)/],
		    'audio-api'               : [/\.(?:AudioContext|webkitAudioContext)/],
		    fullscreen                : [/(?:ms|moz|webkit)?(?:r|R)equestFull(?:S|s)creen\s*\(.*?\)/],
		    requestanimationframe     : [/\.(?:webkit|moz)?(?:r|R)equestAnimationFrame/],
		    matchmedia                : [/\.matchMedia\s*\(/],
		    getcomputedstyle          : [/\.getComputedStyle\s*\(/],
		    pagevisibility            : [/(?:\'|")(?:moz|ms|webkit)?visibilitychange(?:\'|")/],
		    pointer                   : [/(?:\.pointerType|\.pointerEnabled|pointer(?:down|up|cancel|move|over|out|enter|leave)|(?:got|lost)pointercapture)/],
		    cryptography              : [/\.(?:ms)?(?:c|C)rypto(?:\.subtle)?/],
		    template                  : [/\.content(?:\s*(?:;|\,|\))|\.)/, /\.importNode\s*/],
		    'channel-messaging'       : [/=\s*new\s*MessageChannel\s*\(\s*\)/],
		    mutationobserver          : [/=\s*new\s*MutationObserver\s*\(/],
		    'canvas-blending'         : [/\.globalCompositeOperation\s*=/],
		    clipboard                 : [/new\s*ClipboardEvent\s*\(|\.addEventListener\s*\(\s*(?:\'|")(before)?(?:copy|cut|paste)(?:\'|")/],
		    rtcpeerconnection         : [/\.(?:moz|webkit)?RTCPeerConnection/],
		    vibration                 : [/\.vibrate\s*\(/],
		    'web-speech'              : [/=\s*new\s*(?:webkit)SpeechRecognition\s*\(\s*\)/],
		    'high-resolution-time'    : [/performance\.now\s*\(\s*\)/],
		    'battery-status'          : [/\.(?:mozB|webkitB|b)?attery(?:\s*)(?:;)?/],
		    'speech-synthesis'        : [/=\s*new\s*SpeechSynthesisUtterance\s*\(\s*\)/],
		    'user-timing'             : [/performance\.(?:mark|clearMarks|measure|clearMeasure)\s*\(/],
		    'ambient-light'           : [/\.addEventListener\s*\(\s*(?:\'|")devicelight(?:\'|")\s*,/],
		    domcontentloaded          : [/\.addEventListener\s*\(\s*(?:\'|")DOMContentLoaded(?:\'|")\s*,/],
		    proximity                 : [/\.addEventListener\s*\(\s*(?:\'|")deviceproximity(?:\'|")\s*,/],
		    gamepad                   : [/\.(?:webkitG|g)?etGamepads\s*\(\s*\)/],
		    'font-loading'            : [/(?:\.fonts.(?:add|load|ready)\s*\(|new\s*FontFace\s*\()/],
		    'screen-orientation'      : [/\.addEventListener\s*\(\s*(?:\'|")(?:moz|webkit|ms)?orientationchange(?:\'|")/],
		    getrandomvalues           : [/\.(?:ms)?(?:c|C)rypto.getRandomValues\s*\(/],
		    'css-supports-api'        : [/CSS.supports\s*\(/],
		    'atob-btoa'               : [/\.(?:atob|btoa)\s*\(/],
		    imports                   : [/\.querySelector(?:All)?\s*\((?:\'|")link\[rel=(?:\'|")import(?:\'|")](?:\'|")/],
		    'resource-timing'         : [/\.getEntriesByType\s*\(\s*(?:\'|")resource(?:\'|")\s*\)/],
		    'web-animation'           : [/(?:\S*?)\.animate\s*\(\s*/],
		    'custom-elements'         : [/(?:\S*?)\.registerElement\s*\(\s*(?:\'|")\S*?(?:\'|")/],
		    filereader                : [/=\s*new\s*FileReader\s*\(\s*\)/],
		    filesystem                : [/\.(?:r|webkitR)equestFileSystem/],
		    fileapi                   : [/(?:\.dataTransfer|\.files(?:\[\d*?]|\.item|\.length|\s*;))/],
		    promises                  : [/=\s*new\s*Promise\s*\(/],
		    // xhr2                      : [/=\s*new\s*FormData\s*\(|\.responseType\s*=\s*(?:\'|")(?:arraybuffer|blob|document|json|text)(?:\'|")/],
		    'obj-create'              : [/Object\.create\s*\(/],
		    'obj-defineproperty'      : [/Object\.defineProperty\s*\(/],
		    'obj-defineproperties'    : [/Object\.defineProperties\s*\(/],
		    'obj-getprototypeof'      : [/Object\.getPrototypeOf\s*\(/],
		    'obj-keys'                : [/Object\.keys\s*\(/],
		    'obj-seal'                : [/Object\.seal\s*\(/],
		    'obj-freeze'              : [/Object\.freeze\s*\(/],
		    'obj-preventextensions'   : [/Object\.preventExtensions\s*\(/],
		    'obj-issealed'            : [/Object\.isSealed\s*\(/],
		    'obj-isfrozen'            : [/Object\.isFrozen\s*\(/],
		    'obj-isextensible'        : [/Object\.isExtensible\s*\(/],
		    'obj-getownpropertydesc'  : [/Object\.getOwnPropertyDescriptor\s*\(/],
		    'obj-getownpropertynames' : [/Object\.getOwnPropertyNames\s*\(/],
		    'date-toisostring'        : [/\.toISOString\s(\(\s*)/],
		    'date-now'                : [/Date\.now\s*\(\s*\)/],
		    'array-isarray'           : [/Array\.isArray\s*\(/],
		    'function-bind'           : [/\.bind\s*\(/],
		    'string-trim'             : [/\.trim\s*\(\s*\)/],
		    'array-indexof'           : [/\.indexOf\s*\(.*?(?:,.*?)?\s*\)/],
		    'array-lastindexof'       : [/\.lastIndexOf\s*\(.*?(?:,.*?)?\s*\)/],
		    'array-every'             : [/\.every\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-some'              : [/\.some\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-foreach'           : [/\.forEach\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-map'               : [/\.map\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-filter'            : [/\.filter\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-reduce'            : [/\.reduce\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'array-reduceRight'       : [/\.reduceRight\s*\(\s*(?:function|\S*?(?:,\s*\S*?)?\s*\))/],
		    'strict-mode'             : [/(?:\'|")use strict(?:\'|")/]
	    },
	    _sources = {
		    'static/data/additional.json' : null,
		    'static/data/caniuse2.json'   : null
	    },
	    _callCount = 0;

	/**
	* Iterates over the keys of an object and calls a callback function when the
	* key belongs to he object itself and not to its prototype.
	*/
	function iterate(object, callback) {
		for (var key in object) {
			if (object.hasOwnProperty(key)) {
				callback(key, object[key]);
			}
		}
	}

	function _createSupportObject(versionInfo) {
		var result = {};
		result.versions = [];

		result.fromVersion = versionInfo.version;
		result.versions.push(versionInfo.version);
		result.containsCurrentVersion = versionInfo.era === 0;
		result.support = versionInfo.support;

		return result;
	}

	/**
	* Load the JSON files containing the compatibility data.
	*/
	function _loadData() {
		_isReady = false;
		_attempts++;
		iterate(_sources, function(key) {
			if (_sources[key] == null) {
				_callCount++;
				var ajax = new Ajax({
					callbackOnSuccess : _onAjaxSuccess,
					callbackOnError   : _onAjaxError
				});
				Intermediary.publish('notification:info', {
					level   : 9,
					message : 'Downloading compatibility data from "' + key + '" (attempt ' + _attempts + ').'
				});

				ajax.makeRequest(key);
			}
		});
	}

	function _md2html(markdown) {
		if (markdown == null) {
			return null;
		}

		markdown = markdown.replace(/\[(.*?)]\((.*?)\)/g, function(match, description, url) {
			return '<a href="' + url + '">' + description + '</a>';
		});

		markdown = markdown.replace(/`(.*?)`/g, function(match, note) {
			return '<code class="inline-code">' + note + '</code>';
		});

		return markdown;
	}

	function _normalizeAgents(supportObj, agents) {
		// Initialize the result var
		var merge = {};
		// Iterate over the user agents
		iterate(agents, function(agent, agentData) {
			// Initialize the object for the current agent
			merge[agent] = {};
			// Loop over the array with versions
			for (var index = 0, ubound = agentData.version_list.length; index < ubound; index++) {
				// Make sure the current index contains a version number
				if (agentData.version_list[index] != null) {
					// Add an entry to the merged object. If the supportObj has data for the current version we will
					// copy that data to the merged object. If the supportObj has no data on the version we will just
					// assume the version supports the feature
					merge[agent][agentData.version_list[index].version] = (supportObj[agent][agentData.version_list[index].version] == null) ? 'y' : supportObj[agent][agentData.version_list[index].version];
				}
			}
		});
		return merge;
	}

	function _normalizeBrowserSupport() {
		// Iterate over all features that can be detected
		iterate(_features, function(feature, data) {
			// Iterate over all user agents
			var maxRowCount = 0;
			iterate(data.stats, function(agent, support) {
				var normalized = [],
					current,
					previousItem;
				// Iterate over each version of the user agent
				iterate(support, function(key, value) {
					if (current == null) {
						current = _createSupportObject(value);
					} else if (value.support !== current.support) {
						current.toVersion = previousItem.version;
						normalized.push(current);
						current = _createSupportObject(value);
					} else {
						current.versions.push(value.version);
					}
					previousItem = value;
				});
				current.toVersion = previousItem.version;
				normalized.push(current);

				data.stats[agent] = normalized;
				if (normalized.length > maxRowCount) {
					maxRowCount = normalized.length;
				}
			});
			_features[feature].maxRowCount = maxRowCount;
		});
	}

	function _normalizeData() {
		// Initialize the object to hold the data
		_features = {};
		_caseCount = 0;

		// Keep the agents information
		_agents = _sources['static/data/caniuse2.json'].agents;
		// Process the data from can I use
		_processCanIUseData(_sources['static/data/caniuse2.json'].data);
		// Process the data from the additional.json file
		_processAdditionalData(_sources['static/data/additional.json'].data);
		_normalizeBrowserSupport();
	}

	function _normalizeNotes(categoryKey, note, notesByNum) {
		// notesByNum is an object so we can't query how many childeren it has,
		// by creating the list object and iterating over the notesByNum object
		// we can create the list that should be shown for the category and
		// later we can check if the list has children.
		var list = document.createElement('ol');
		iterate(notesByNum, function(key, value) {
			var item = document.createElement('li');
			item.innerHTML = _md2html(value);
			item.setAttribute('id', 'note_' + categoryKey + '_' + key);
			list.appendChild(item);
		});

		// Check if there are notes by number or if there is a single note
		if (list.children.length === 0 && note === '') {
			// No notes of any kind, return null
			return null;
		}

		// There is some sort of note, create a section to hold it and give it a
		// title
		var section = document.createElement('section'),
			noteTitle = document.createElement('h4');

		// Give the title a text to display
		noteTitle.textContent = 'Notes';
		// Add the title to the section
		section.appendChild(noteTitle);
		// Check if the note property has a string
		if (note !== '') {
			var paragraphs = note.match(/(^(.*?)(?:\n|\r))|((?:\n|\r)(.*?)(?:\n|\r)|(?:\n|\r)(.*?)$|^(.*?)$)/g);
			for (var index = 0, ubound = paragraphs.length; index < ubound; index++) {
				if (paragraphs[index] != null && paragraphs[index] !== '' && paragraphs[index].replace(/\s/g, '').length !== 0) {
					var p = document.createElement('p');
					p.innerHTML = _md2html(paragraphs[index]);
					section.appendChild(p);
				}
			}
		}
		// Check if the list has children
		if (list.children.length > 0) {
			// The list has items, add the list to the section
			section.appendChild(list);
		}
		// Return the innerHTML of the section, this will be the content to be
		// shown in the report
		return section.innerHTML;
	}

	function _normalizeVersions(category, agents) {
		var browsers = {};

		// Check if agents was passed along
		if (agents != null) {
			// Normalize the agents
			category.stats = _normalizeAgents(category.stats, agents);
		}

		// Iterate over the supports data
		iterate(category.stats, function(browser, values) {
			var versions = [];
			iterate(values, function(version, support) {
				versions.push({version: version, support: support});
			});

			versions.sort(function(a, b) {
				a = parseFloat(a.version);
				b = parseFloat(b.version);

				if (a < b) {
					return -1;
				} else if (a > b) {
					return 1;
				} else {
					return 0;
				}
			});

			browsers[browser] = versions;
		});
		return browsers;
	}

	function _onAjaxError(result) {
		// Decrease the number of outstanding calls
		_callCount--;

		// Send out a message about the failed attempt
		Intermediary.publish('datastore:download-failed', {
			level   : 1,
			message : 'Unable to download compatibility data from (' + event.url + ')',
			error   : result
		});

		// Call the call completed method for some housekeeping
		_onCallCompleted();
	}

	function _onAjaxSuccess(event) {
		Intermediary.publish('notification:info', {
			level   : 9,
			message : 'Compatibility data from "' + event.url + '" downloaded.'
		});

		// Decrease the number of outstanding calls
		_callCount--;

		// Store the raw data
		_sources[event.url] = event.result;

		// Call the call completed method for some housekeeping
		_onCallCompleted();
	}

	function _onCallCompleted() {
		// Check if the call count is 0, if not we need to wait for more data to
		// arrive
		if (_callCount !== 0) {
			return;
		}

		var retry = false;
		iterate(_sources, function(key) {
			if (_sources[key] == null) {
				retry = true;
			}
		});

		if (retry) {
			if (_attempts < 5) {
				_loadData();
			} else {
				Intermediary.publish('datastore:too-many-attempts');
			}
		} else {
			// Normalize the data
			_normalizeData();

			// Clear up the raw downloaded data
			iterate(_sources, function(key) {
				_sources[key] = null;
			});

			// Set the ready flag
			_isReady = true;

			// Inform subscribers of the fact that the data has been downloaded
			Intermediary.publish('datastore:download-completed', {
				level   : 9,
				message : 'Compatibility data successfully downloaded'
			});
		}
	}

	function _processAdditionalData(data) {
		iterate(data, function(key, value) {
			if (_rules[key] != null) {
				_caseCount++;
				_features[key] = value;
				_features[key].key = key;
				if (key === 'obj-defineproperty') {
					console.log(value);
				}
				_features[key].notes = _normalizeNotes(key, value.notes, value.notes_by_num);
				_features[key].stats = _normalizeVersions(_features[key], _agents);
				_features[key].tests = _rules[key];
			}
		});
	}

	function _processCanIUseData(data) {
		// Iterate over all the data
		iterate(data, function(key, values) {
			// Check if this item is something we would be interested in
			if (values.categories.indexOf('JS API') > -1 || (values.categories.indexOf('DOM') > -1) || (values.categories.indexOf('Canvas') > -1)) {
				if (_rules[key] != null) {
					_caseCount++;
					_features[key] = values;
					_features[key].key = key;
					_features[key].notes = _normalizeNotes(key, values.notes, values.notes_by_num);
					_features[key].stats = _normalizeVersions(_features[key]);
					_features[key].tests = _rules[key];
				}
			}
		});
	}

	return {
		getAgents: function() {
			return _agents;
		},

		getCategoryCount: function() {
			return _caseCount;
		},

		getData: function() {
			return _features;
		},

		isReady: function() {
			return _isReady;
		},

		loadData: function() {
			if (this.isReady()) {
				Intermediary.publish('datastore:download-completed', {
					level   : 9,
					message : 'Compatibility data successfully downloaded'
				});
			} else {
				_attempts = 0;
				_loadData();
			}
		}
	};
}));
