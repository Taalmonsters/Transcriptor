var ready;

ready = function() {
	Transcriptor.init();
	$(document).on("mouseenter", 'div[data-tooltip-id]', function() {
		$(this).tooltip({
	        title: Transcriptor.getTooltip,
	        html: true,
	        container: 'body',
	    });
		$(this).tooltip('show');
	});

	$(document).on("mouseleave", 'div[data-tooltip-id]', function() {
		$(this).tooltip('hide');
	});
	
	$(document).on('click', 'ul.nav > li > a', function (e) {
		Transcriptor.currentTab = $(this).data('tab-id');
		if (Transcriptor.currentTab == 1) {
			$("#app div.extended-form").addClass("hidden");
			$("#app div.simple-form").removeClass("hidden");
		} else if (Transcriptor.currentTab == 2) {
			$("#app div.simple-form").addClass("hidden");
			$("#app div.extended-form").removeClass("hidden");
		}
    });
	
	$(document).keypress(function(e) {
		console.log("keypress");
		if (e.which == 13)
			$("#app .btn-submit").trigger("click");
	});
};

$(document).ready(ready);


Transcriptor = {
//	If true, add config/clam.properties or environment variables with appropriate credentials (see README)
	authenticate: false,
//	URL of CLAM application, only used when Transcriptor.authenticate = false
	baseUrl: 'http://ticclops.uvt.nl/transapp/',
//	URL where the interface is hosted
	resetUrl: 'http://ticclops.uvt.nl/Transcriptor/',
//	Tooltip cache
	tooltips: [],
	currentTab: 1,
	
//	Set to true to turn on logging in JS console
	doDebug: false,
	
	debug : function(msg) {
		if (Transcriptor.doDebug)
			console.log(msg);
	},
	
//	Transcriptor initialization
	
	init : function() {
		
		$(".btn-reset").click(function(e){
			e.preventDefault();
			window.location = Transcriptor.resetUrl;
		});
		
		$("#open-keyboard").click(function(e){
			e.preventDefault();
			var kb = $('#name').getkeyboard();
			if ( kb.isOpen ) {
				kb.accept();
				kb.close();
			} else {
				kb.reveal();
			}
		});
		
		$("#app .btn-submit").click(function(e){
			e.preventDefault();
			var name = $("#name").val();
			var type = $('input:radio[name=type]:checked').val();
			if (Transcriptor.currentTab == 1) {
				if (name != null && name.length > 0) {
					if (type === 'loc') {
						name = name + "_LOC";
					} else if (type === 'other') {
						name = name + "_OTH";
					}
					Transcriptor.debug(name);
					Transcriptor.performQuickSearch(name);
				}
			} else if (Transcriptor.currentTab == 2) {
				var from_lang = $( "#from-lang option:selected" ).val();
				var to_lang = $( "#to-lang option:selected" ).val();
				if (name != null && name.length > 0) {
					$("#output .panel").html('<span class="loading"></span>');
					$("#output").removeClass("hidden");
					Transcriptor.debug(name);
					Transcriptor.performExtendedSearch(name, type, from_lang, to_lang);
				}
			}
		});
		
		$("a.info-panel-toggle").click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var key = $(this).data("key");
			var target = $(this).data("target");
			$("#"+target).toggleClass("hidden");
			if ($("#"+target+" .panel-body").html().length == 0) {
				$("#"+target+" .panel-body").html('<span class="loading"></span>');
				Transcriptor.sendCORSRequest('php/instructions.php?key='+key, 'GET', Transcriptor.addInstructions, target);
			}
		});

		Transcriptor.sendCORSRequest('php/about.php', 'GET', Transcriptor.addAbout, null);
		Transcriptor.sendCORSRequest('php/logos.php', 'GET', Transcriptor.addLogos, null);
		Transcriptor.loadAvailableLanguages();
	},
	
//	Transcriptor methods (CLAM communication and data display)
	
	addAbout : function(data, p) {
		$(data).each(function (i, item) {
            $("#about > div").append(item);
        });
	},
	
	addInstructions : function(data, target) {
		$("#"+target+" .panel-body").html(data);
	},
	
	addLanguages : function(xml, target) {
		$("#app-description").html('<div class="panel panel-info"><div class="panel-body">'+$(xml).find('description').text()+'</div></div>');
		Transcriptor.addLanguagesForType(xml, "lang", "from-lang");
		Transcriptor.addLanguagesForType(xml, "lang2", "to-lang");
	},
	
	addLanguagesForType : function(xml, id, target) {
		var langParam = $(xml).find('ChoiceParameter[id="'+id+'"]');
		if (langParam && $(langParam).find('choice').length > 0) {
			var languages = $(langParam).find('choice');
			$(languages).each(function(index, language){
				$("#"+target).append('<option value="'+language.getAttribute('id')+'">'+$(language).text()+'</option>');
			});
		}
	},
	
	addLogos : function(data, p) {
		$(data).each(function (i, item) {
			var cl = '';
			if (i == 0) {
				cl = 'ru';
			}
            $("#logos > div").append("<a href='"+item.link+"' target='_blank'><img class='mini-logo "+cl+"' alt='"+item.alt+"' src='" + item.img + "'></a>");
        });
	},
	
	checkProjectStatus : function(data, params) {
		Transcriptor.debug("checkProjectStatus");
		var status = $(data).find('status').attr('code');
		if (status == 2) {
			// If completed, retrieve result
			Transcriptor.retrieveProjectOutput(params['project']);
		} else {
			// Otherwise, recheck result
			setTimeout(function(){ Transcriptor.getProjectResult(null, params); }, 10000);
		}
	},
	
	createProject : function(project, name, type, from, to) {
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+project, 'PUT', Transcriptor.uploadProjectContents, { project: project, name: name, type: type, from: from, to: to });
	},
	
	deleteProject : function(data, params) {
		Transcriptor.debug("deleteProject");
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+project, 'DELETE', null, null);
	},
	
	displayOutput : function(data, params) {
		Transcriptor.debug("displayOutput");
		Transcriptor.debug(data);
		if (data.indexOf('id="resultaten"') > -1) {
			$("#output .panel").html($.parseHTML(data));
		} else {
			$("#output .panel").html(data.replace(/\n/g, "<br/>"));
		}
	},
	
	executeProject : function(data, params) {
		Transcriptor.debug("executeProject");
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+params['project']+'?encoding=utf-8&x='+params['name']+'&lang='+params['from']+'&lang2='+params['to']+'&name='+Transcriptor.typeToName(params['type']), 'POST', Transcriptor.getProjectResult, { project: params['project'] });
	},
	
	generateProjectName : function() {
		var chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZabcdefghiklmnopqrstuvwxyz";
		var string_length = 8;
		var randomstring = '';
		for (var i=0; i<string_length; i++) {
			var rnum = Math.floor(Math.random() * chars.length);
			randomstring += chars.substring(rnum,rnum+1);
		}
		return "project_"+randomstring;
	},
	
	getProjectResult : function(data, params) {
		Transcriptor.debug("getProjectResult");
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+params['project']+'/', 'GET', Transcriptor.checkProjectStatus, params);
	},
	
	getTooltip : function() {
		var element = $(this);
		if (element.attr('data-tooltip-id')) {
		    var id = element.data('tooltip-id');
		    if (id in Transcriptor.tooltips){
		        return Transcriptor.tooltips[id];
		    }
	
		    var localData = "error";
	
		    $.ajax('php/tooltips.php?id='+id, {
		        async: false,
		        success: function(data){
		            localData = data;
		        }
		    });
	
		    Transcriptor.tooltips[id] = localData;
		    return localData;
		}
		return false;
	},
	
	loadAvailableLanguages : function() {
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl, 'GET', Transcriptor.addLanguages, null);
	},
	
	performExtendedSearch : function(name, type, from, to) {
		$("#output .panel").html('<span class="loading"></span>');
		$("#output").removeClass("hidden");
		Transcriptor.createProject(Transcriptor.generateProjectName(), name, type, from, to);
	},
	
	performQuickSearch : function(name) {
		$("#output .panel").html('<span class="loading"></span>');
		$("#output").removeClass("hidden");
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+"actions/Transliterate/?x="+name, 'GET', Transcriptor.displayOutput, null);
	},
	
	retrieveProjectOutput : function(project) {
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+project+'/output/output.txt', 'GET', Transcriptor.displayOutput, null);
	},
	
	uploadProjectContents : function(data, params) {
		Transcriptor.debug("uploadProjectContents");
		Transcriptor.sendAjaxRequest(Transcriptor.baseUrl+params['project']+'/input/input?inputtemplate=textinput&encoding=utf-8&contents='+params['name'], 'POST', Transcriptor.executeProject, params);
	},
	
	typeToName : function(type) {
		if (type === 'loc')
			return 'GEO';
		else
			return 'JRC';
	},
	
//	Request methods
	
	createRequest : function(method, url) {
		var xhr = new XMLHttpRequest();
		if ("withCredentials" in xhr) {
			xhr.open(method, url, true);
		} else if (typeof XDomainRequest != "undefined") {
			xhr = new XDomainRequest();
			xhr.open(method, url);
		} else {
			xhr = null;
		}
		return xhr;
	},
	
	sendCORSRequest : function(url, method, callback, params, responseKey) {
		var xhr = Transcriptor.createRequest(method, url);
		if (!xhr) {
			return;
		}
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		xhr.onload = function() {
			if (callback != null) {
				if (responseKey != null) {
					var resp = JSON.parse(xhr.responseText)
					callback(resp[responseKey], params);
				} else
					callback(JSON.parse(xhr.responseText), params);
			}
		};
		xhr.onerror = function() {
		};
		xhr.send();
	},
	
	sendClamRequest : function(url, params, method, callback, callbackParams) {
		if (Transcriptor.authenticate) {
			params["url"] = url;
			params["method"] = method;
			p = [];
			for (var i in params) {
				p[] = i+"="+params[i];
			}
			Transcriptor.sendAjaxRequest("php/clam.php?"+p.join("&"), "GET", callback, callbackParams, "response");
		} else {
			p = [];
			for (var i in params) {
				p[] = i+"="+params[i];
			}
			Transcriptor.sendAjaxRequest(url+"?"+p.join("&"), method, callback, callbackParams);
		}
	},
	
	sendAjaxRequest : function(url, method, callback, params) {
		$.ajax({ 
			type: method, 
			url: url, 
			dataType: "text", 
			success: function(data){
				if (callback != null)
					callback(data, params);
			},
			error: function(response){
				if ((response.status < 200) || (response.status > 299)) {
					console.log(response.responseText);
				}
			}
		});
	}
};
