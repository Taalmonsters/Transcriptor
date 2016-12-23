var templates = {
	result: [{'<>':'div','id':'resultaten','class':'row','html':function() {
        	return($.json2html(this.recommended,templates.recommended).html+$.json2html(this.other,templates.other).html);
    	}}
	],
	recommended: [
	    {'<>':'div','class':'panel panel','html':[
		    {'<>':'div','class':'row','html':[
		        {'<>':'div','class':'col-xs-8 col-xs-offset-2 text-center','data-toggle':'tooltip','data-tooltip-id':'nederlands','data-placement':'left','html':function() {
		        	var main_img = $.json2html(this,templates.main_img).html;
		        	var main_field = this.fields[0][0].value;
		        	if (this.fields[0].length > 1)
		        		main_field = main_field+' ('+this.fields[0][1].value+')';
					return main_img+$.json2html({main_field: main_field},templates.main_field_title).html;
		        }},
		        {'<>':'div','class':'col-xs-12 main-output-group text-center','html':function() {
		        	var wiki_img = (this.fields.length > 1 && this.fields[1][0].id === 'wikipedia') ? $.json2html({},templates.wiki_img).html : '';
					var wiki_val = (this.fields.length > 1 && this.fields[1][0].id === 'wikipedia') ? $.json2html({value: this.fields[1][0].value},templates.wiki_value).html : '';
					return wiki_img+wiki_val;
				}},
				{'<>':'div','class':'col-xs-12 text-center search','html':function() {
					var links = [];
					links.push({text:'Google',url:'https://www.google.nl/#q='+this.fields[0][0].value+'&nfpr=1'});
					if (this.fields.length > 1 && this.fields[1][0].id === 'wikipedia')
						links.push({text:'Wikipedia',url:'https://nl.wikipedia.org/wiki/Speciaal:Zoeken?search='+this.fields[1][0].value});
					if (this.google_maps && this.google_maps.length > 0)
						links.push({text:'Google Maps',url:'https://www.google.com/maps?oi=map&q='+this.google_maps});
					return $.json2html(links,templates.link);
				}}
		    ]}
		]}
	],
	main_img: [{'<>':'img','class':'advies logo','src':'afbeeldingen/${img}'}],
	wiki_img: [{'<>':'img','class':'bullet-logo','data-pin-nopin':'true','style':'right: 0px; position: relative;','src':'afbeeldingen/wikipedia.png'}],
	wiki_value: [{'<>':'p','html':'${value}'}],
	main_field_title: [{'<>':'h3','class':'main-field-title','html':'${main_field}'}],
	other: [
		{'<>':'div','class':'panel panel-default','html':[
		    {'<>':'div','class':'row','html':[
		        {'<>':'div','class':'col-xs-3 col-sm-2 col-md-1','html':[
		           {'<>':'img','class':'logo','src':'afbeeldingen/${img}'}
		        ]},
		        {'<>':'div','class':'col-xs-9 col-sm-10 col-md-11','html':function() {
					return($.json2html(this.fields,templates.field));
				}}
		    ]}
		]}
	],
	external_link: [{'<>':'a','href':'${url}','target':'_blank','html':[{'<>':'img','class':'external-link','src':'afbeeldingen/externe-link.png'}]}],
	field: [
	    {'<>':'div','class':function() {
	    	if (this[0].main === 'true')
	    		return 'output-group main';
	    	else
	    		return 'output-group';
	    },'data-toggle':'tooltip','data-placement':'left','data-tooltip-id':function() {
	    	return this[0].id;
	    },'html':function() {
	    	var bullet = '';
	    	if (this[0].bullet && this[0].bullet.length > 0)
	    		bullet = $.json2html(this,templates.bullet).html;
	    	var content = $.json2html(this,templates.content).html;
	    	return bullet+content;
	    }}
	],
	link: [{'<>':'a','href':'${url}','class':'main-block-link','target':'_blank','html':'${text}'}],
	bullet: [{'<>':'img','class':'bullet-logo','src':'afbeeldingen/${bullet}'}],
	content: [{'<>':'p','html':function() {
    	var c = (this.label.length > 0) ? this.label+': '+this.value : this.value;
    	return (this.external_link && this.external_link.length > 0) ? c+' '+$.json2html({url:this.external_link},templates.external_link).html : c;
    }}]
};

var ready;

ready = function() {
	Transcriptor.init();
};

$(document).ready(ready);

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

$(document).keypress(function(e) {
	if (e.which == 13)
		$("#app .btn-submit").trigger("click");
});


Transcriptor = {
//	If true, add config/clam.properties or environment variables with appropriate credentials (see README)
	authenticate: false,
//	URL of CLAM application, only used when Transcriptor.authenticate = false
	baseUrl: 'http://ticclops.uvt.nl/transapp/',
//	URL where the interface is hosted
	resetUrl: 'http://ticclops.uvt.nl/Transcriptor/',
//	Tooltip cache
	tooltips: [],
	currentTab: 2,
	redirectUrl: 'http://www.taalmannetje.nl/transcriptor',
	
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
					$("#output .panel").html('<span class="loading">Aan het werk... (Vereist 2 tot 3 minuten...)</span>');
					$("#output").removeClass("hidden");
					Transcriptor.debug(name);
					Transcriptor.performExtendedSearch(name, type, from_lang, to_lang);
				}
			}
		});
		
		$("a.info-panel-toggle").click(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var target = $(this).data("target");
			$("#"+target).toggleClass("hidden");
		});
		
		$.getJSON( "config/transcriptor.json", function( data ) {
			Transcriptor.tooltips = data.tooltips;
			$("#app-description").html('<div class="panel panel-info"><div class="panel-body">'+data.description+'</div></div>');
			$("#about > div").append(data.info);
			Transcriptor.addLogos(data.logos);
			
			$.each(document.getElementsByClassName("info-panel-toggle"), function() {
				var key = $(this).data("key");
				var target = $(this).data("target");
				if ($("#"+target+" .panel-body").html().length == 0)
					$("#"+target+" .panel-body").html(data.instructions[key]);
			});
		});

		Transcriptor.loadAvailableLanguages();
		Transcriptor.checkInput();
	},
	
//	Transcriptor methods (CLAM communication and data display)
	
	addInstructions : function(data, target) {
		$("#"+target+" .panel-body").html(data);
	},
	
	addLanguages : function(xml, target) {
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
	
	addLogos : function(data) {
		$(data).each(function (i, item) {
			var cl = '';
			if (i == 0) {
				cl = 'ru';
			}
            $("#logos > div").append("<a href='"+item.url+"' target='_blank'><img class='mini-logo "+cl+"' alt='"+item.text+"' src='" + item.img + "'></a>");
        });
	},
	
	checkGetParameter: function(param) {
	    var items = location.search.substr(1).split("&");
	    for (var i = 0; i < items.length; i++) {
	        var parts = items[i].split("=");
	        if (parts[0] === param) {
	        	return decodeURIComponent(parts[1]);
	        }
	    }
	    return null;
	},
	
	checkInput: function(){
		$("#name").val(Transcriptor.checkGetParameter("q"));
		var type = Transcriptor.checkGetParameter("t");
		if (type) {
			if (type === "other") type = "per";
			$('input[name=type]').filter('[value='+type+']').prop('checked', true);
		} else 
			$('input[name=type]').filter('[value=per]').prop('checked', true);
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
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+project, {}, 'PUT',  Transcriptor.uploadProjectContents, { project: project, name: name, type: type, from: from, to: to });
	},
	
	deleteProject : function(data, params) {
		Transcriptor.debug("deleteProject");
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+project, {}, 'DELETE',  null, null);
	},
	
	displayOutput : function(data, params) {
		Transcriptor.debug("displayOutput");
		Transcriptor.debug(data);
		if (Transcriptor.currentTab == 1) {
			Transcriptor.debug("tab 1");
			$('#output-panel').html($.json2html(data, templates.result).html);
		} else {
			Transcriptor.debug("tab 2");
			$("#output-panel").html(data.replace(/\n/g, "<br/>"));
		}
	},
	
	executeProject : function(data, params) {
		Transcriptor.debug("executeProject");
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+params['project'], {'encoding' : 'utf-8', 'lang': params['from'], 'lang2': params['to'], 'name': Transcriptor.typeToName(params['type'])}, 'POST', Transcriptor.getProjectResult, { project: params['project'] });
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
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+params['project']+'/', {}, 'GET',  Transcriptor.checkProjectStatus, params);
	},
	
	getTooltip : function() {
		var element = $(this);
		if (element.attr('data-tooltip-id')) {
		    var id = element.data('tooltip-id');
		    if (id in Transcriptor.tooltips){
		        return Transcriptor.tooltips[id];
		    }
		}
		return false;
	},
	
	loadAvailableLanguages : function() {
		Transcriptor.sendClamRequest(Transcriptor.baseUrl, {}, 'GET',  Transcriptor.addLanguages, null);
	},
	
	performExtendedSearch : function(name, type, from, to) {
		$("#output .panel").html('<span class="loading"> Aan het werk... (Vereist 2 tot 3 minuten...)</span>');
		$("#output").removeClass("hidden");
		Transcriptor.createProject(Transcriptor.generateProjectName(), name, type, from, to);
	},
	
	performQuickSearch : function(name) {
		$("#output .panel").html('<span class="loading"> Aan het werk...</span>');
		$("#output").removeClass("hidden");
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+"actions/Transliterate/", {'x': name}, 'GET',  Transcriptor.displayOutput, null);
	},
	
	redirect: function(e) {
		e.preventDefault();
		window.location = Transcriptor.redirectUrl+"?q="+$("#name").val()+"&t="+$('input[name=type]:checked').val();
	},
	
	retrieveProjectOutput : function(project) {
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+project+'/output/output.txt', {}, 'GET',  Transcriptor.displayOutput, null);
	},
	
	uploadProjectContents : function(data, params) {
		Transcriptor.debug("uploadProjectContents");
		Transcriptor.sendClamRequest(Transcriptor.baseUrl+params['project']+'/input/input', {'inputtemplate': 'textinput', 'encoding': 'utf-8', 'contents': params['name']}, 'POST',  Transcriptor.executeProject, params);
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
				p.push(i+"="+params[i]);
			}
			Transcriptor.sendAjaxRequest("php/clam.php?"+p.join("&"), "GET", callback, callbackParams, "response");
		} else {
			p = [];
			for (var i in params) {
				p.push(i+"="+params[i]);
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
