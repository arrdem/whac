var pt = null;

var modelTypes = [];
modelTypes.caster = 0;
modelTypes.lightjack = modelTypes.lesserbeast = modelTypes.lightbeast = 1;
modelTypes.heavyjack = modelTypes.heavybeast = 2;
modelTypes.unit = modelTypes.ua = 3;
modelTypes.solo = 4;

var modelTypeNames = [];
modelTypeNames[0] = "Warcasters";
modelTypeNames[1] = "Light Warjacks/beasts";
modelTypeNames[2] = "Heavy Warjacks/beasts";
modelTypeNames[3] = "Units and Unit Attachments";
modelTypeNames[4] = "Solos";

function Faction(name, prefix, colors) {
	this.name = name;
	this.prefix = prefix;
	this.colors = colors;
}
var factions = [];

//var faction = undefined;
function ListSize(name, fields, casters, points) {
	this.name = name;
	this.fields = fields;
	this.casters = casters;
	this.points = points;
	this.get = function(name) {
		for(var c=0; c<this.fields.length; c++) {
			if(this.fields[c].name == name) {
				return this.fields[c].value;
			}
		}
	};
}
var listSize = null;

function System(name, listSizes, overrides, armies, factions, description) {
	this.name = name;
	this.listSizes = listSizes;
	this.overrides = overrides;
	this.armies = armies;
	this.factions = factions;
	this.description = description;
	this.executeOverride = function(name, params) {
		for(var c=0; c<this.overrides.length; c++) {
			var override = this.overrides[c];
			if(override.name == name) {
				return eval(override.value+"("+params+")");
			}
		}
	};
}
var systems = [];

function Model (id, name, type, fa, modelOptions, children, dependant, animosity, fieldOfficer) {
	this.id = id;
	this.name = name;
	this.type = type;
	this.fa = fa;
	this.modelOptions = modelOptions;
	this.children = (children == null)?[]:((children.length != undefined)?children:new Array(children));
	this.dependant = (dependant == null)?false:dependant;
	this.animosity = (animosity == null)?[]:animosity.split(" ");
	this.fieldOfficer = (fieldOfficer == null)?[]:fieldOfficer.split(" ");
	
	this.getOption = function(optionId) {
		for(var c = 0; c < this.modelOptions.length; c++) {
			var option = this.modelOptions[c];
			if(option.id == optionId) {
				return option;
			}
		}
	};
}

function ChildGroup(max, ids) {
	this.max = max;
	this.ids = ids.split(" ");
}

function ModelOption (id, name, realModels, hitpoints, labels) {
	this.id = id;
	this.name = name;
	this.realModels = realModels;
	this.hitpoints = hitpoints;
	this.labels = labels;
	
	this.getLabelValue = function(name) {
		if(this.labels == null) {
			return 0;
		}
		for(var c=0; c<this.labels.length; c++) {
			var label = this.labels[c];
			if(label.name == name) {
				return label.value;
			}
		}
		return 0;
	};
}

function Army(name, advantage, hasDefault, subArmies, tiers) {
	this.name = name;
	this.groups = [];
	this.advantage = advantage;
	this.hasDefault = hasDefault;
	this.subArmies = subArmies;
	this.tiers = tiers;
}
function ArmyGroup(name, colors, max, secondaryCasters) {
	this.name = name;
	this.colors = colors;
	this.models = [];
	this.max = (max == null)?999:max;
	this.secondaryCasters = (secondaryCasters == null)?false:secondaryCasters;
}
var armies = [];
function addArmy(army) {
	armies[armies.length] = army;
	for(var c = 0; c < army.groups.length; c++) {
		var group = army.groups[c];
		group.models.sort(nameSorter);
	}
}

var models = [];
function addModel(model) {
	models[models.length] = model;
}

var listId = 0;
function ListModel(model, modelOption) {
	this.id = listId++;
	this.parent = null;
	this.model = model;
	this.modelOption = modelOption;
	this.listModels = [];
	
	this.getChildCount = function(ids) {
		var count = 0;
		for(var c = 0; c < ids.length; c++) {
			for(var m = 0; m < this.listModels.length; m++) {
				if(ids[c] == this.listModels[m].model.id) {
					count++;
				}
			}
		}
		return count;
	};
}

function modelListSorter(a, b) {
	var value = modelTypes[a.model.type] - modelTypes[b.model.type];
	if(value != 0) {
		return value;
	} 
	else {
		var ma = a.model.name;
		var mb = b.model.name;
		if(ma < mb)
			return -1;
		else if (ma > mb)
			return 1;
		else 
			return 0;
	}
}

function nameSorter(a, b) {
	var ma = a.name;
	var mb = b.name;
	if(ma < mb)
		return -1;
	else if (ma > mb)
		return 1;
	else 
		return 0;
}

function typeKeyNameSorter(a, b) {
	var value = a.type - b.type;
	if(value != 0) {
		return value;
	} 
	else {
		var ma = a.key;
		var mb = b.key;
		if(ma < mb)
			return -1;
		else if (ma > mb)
			return 1;
	}
	var ma = a.name;
	var mb = b.name;
	if(ma < mb)
		return -1;
	else if (ma > mb)
		return 1;
	else 
		return 0;
}

function getModelById(id) {
	for(var c = 0; c < models.length; c++) {
		if(models[c].id == id) {
			return models[c];
		}
	}
}

function SavedList(name, format, faction, data, version) {
	this.name = name;
	this.format = format;
	this.faction = faction;
	this.data = data;
	this.version = version;
}

var savedLists = [];

function ArmyTree() {
	this.list = [];
	this.labelValues = [];
	
	this.clear = function() {
		document.getElementById("list").innerHTML = "";
		this.list = [];
		this.recalculatePoints();
		modelList.rebuild();
	};
	
	this.getLabelValue = function(name) {
		for(var c=0; c<this.labelValues.length; c++) {
			var label = this.labelValues[c];
			if(label.name == name) {
				return label.value;
			}
		}
		return 0;
	};

	this.canAdd = function(model, modelOption, alteredFa) {
		if(modelOption == null) {
			modelOption = model.modelOptions[0];
		}
		var fa = (alteredFa == null)?this.allowedCount(model):alteredFa;
		if(this.modelCount(model) >= fa) { 
			return false;
		}
		
		if(model.group.max < 999) {
			var modelCount = 0;
			for(var c = 0; c < model.group.models.length; c++) {
				modelCount += this.modelCount(model.group.models[c]);
			}
			if(modelCount >= model.group.max) {
				return false;
			}
		}
		
		if(model.type == "caster" && this.getLabelValue("casters") >= listSize.get("casters")) {
			return false;
		}
		if(model.group.secondaryCasters && (this.getLabelValue("casters") == 0)) {
			return false;
		}
		
		if(model.animosity != null) {
			for(var a = 0; a < model.animosity.length; a++) {
				if(this.modelCount(getModelById(model.animosity[a])) > 0) {
					return false;
				}
			}
		}

		var tp = this.getLabelValue("points")+modelOption.getLabelValue("points");
		
		var canAdd = true;
		if(model.dependant){
			var addModels = this.findModelsToAddTo(model);
			var substractPoints = 0;
			for(var c = 0; c < addModels.length; c++) {
				var p = addModels[c].modelOption.getLabelValue("points") + this.calculateList(addModels[c].listModels);
				if(p < substractPoints) {
					substractPoints = p;
				}
			}
			canAdd = addModels.length > 0;
			tp += substractPoints;
		}
		return (tp <= listSize.get("points")) && canAdd;
	};
	
	this.modelCount = function(model, l) {
		if(l == null) {
			l = this.list;
		}
		
		var count = 0;
		for(var c = 0; c < l.length; c++) {
			if(l[c].model == model) {
				count++
			}
			count += this.modelCount(model, l[c].listModels);
		}
		return count;
	};

	this.allowedCount = function(model, includeFieldOfficer) {
		if(includeFieldOfficer == null) {
			includeFieldOfficer = true;
		}
		if(model.fa == "U") {
			return 999; 
		}
		else if(model.fa == "C") {
			return 1; 
		}
		else {
			var armyFaAdvantage = (modelList.army.advantage == "+1FA")?1:0;
			
			var fieldOfficerAdvantage = 0;
			if(includeFieldOfficer) {
				var usedByOtherCount = 0;
				var alreadyCounted = [];
				for(var c = 0; c < this.list.length; c++) {
					var m = this.list[c].model;
					for(var f = 0; f < m.fieldOfficer.length; f++) {
						if(m.fieldOfficer[f] == model.id) {
							for(var x = 0; x < m.fieldOfficer.length; x++) {
								if(x != f) {
									var om = getModelById(m.fieldOfficer[x]);
									var counted = false;
									for(var o = 0; o < alreadyCounted.length; o++) {
										counted = counted || om == alreadyCounted[o];
									}
									if(!counted) {
										var otherCount = this.modelCount(om);
										var otherMax = this.allowedCount(om, false);
										if(otherCount > otherMax) {
											usedByOtherCount += otherCount-otherMax;
										}
										alreadyCounted[alreadyCounted.length] = om;
									}
								}
							}
							
							fieldOfficerAdvantage++;
						}
					}
				}
				fieldOfficerAdvantage -= usedByOtherCount;
			}
			return (parseInt(model.fa) + armyFaAdvantage)* listSize.get("casters")+fieldOfficerAdvantage;
		}
	};


	this.findModelsToAddTo = function(model, l, forceParent) {
		if(l == null) {
			l = this.list;
		}
		
		var result = [];
		for(var c = 0; c < l.length; c++) {
			var children = l[c].model.children;
			for(var o = 0; o < children.length; o++) {
				for(var p = 0; p < children[o].ids.length; p++) {
					if(children[o].ids[p] == model.id) {
						if(l[c].getChildCount(children[o].ids) < children[o].max ||
								(forceParent != null && l[c] == forceParent)) {
							result[result.length] = l[c];
						}
					}
				}
					
				var sub = this.findModelsToAddTo(model, l[c].listModels, forceParent);
				if(sub != null) {
					for(var s = 0; s < sub.length; s++) {
						result[result.length] = sub[s];
					}
				}
			}
		}
		return result;
	};

	this.recalculatePoints = function() {
		this.labelValues = [];
		
		this.calculateLabelValues(this.list);
		
		currentSystem.executeOverride("recalcPoints");

		currentSystem.executeOverride("redrawPoints");
	};
	
	this.calculateLabelValues = function(list) {
		for(var c=0; c<list.length; c++) {
			var listModel = list[c];
			if(listModel.modelOption.labels != null) {
				for(var d=0; d<listModel.modelOption.labels.length;d++) {
					var label = listModel.modelOption.labels[d];
					this.addLabelValue(label.name, label.value);
				}
			}
			if(listModel.listModels != null) {
				this.calculateLabelValues(listModel.listModels);
			}
		}
	};
	
	this.addLabelValue = function(name, value) {
		var found = false;
		for(var c=0; c<this.labelValues.length; c++) {
			var labelValue = this.labelValues[c];
			if(labelValue.name == name) {
				found = true;
				labelValue.value += value;
			}
		}
		if(!found) {
			this.labelValues.push({name:name, value:value});
		}
	};
	
	
	this.calculateList = function(l, substractPoints) {
		if(substractPoints == undefined) {
			substractPoints = 0;
		}
		var childPoints = 0;
		var jackPoints = substractPoints;
		var otherPoints = 0;
		for(var c = 0; c < l.length; c++) {
			childPoints += this.calculateList(l[c].listModels,  (l[c].modelOption.getLabelValue("points") < 0)?l[c].modelOptiongetLabelValue("points"):0);

			// relix o f the past
			if(l[c].model.type == "caster") {
				// TODO // TEMP
//				this.casters++;
			}
			else if(l[c].model.type == "lightjack" || l[c].model.type == "heavyjack" || l[c].model.type == "lightbeast" || l[c].model.type == "lesserbeast" || l[c].model.type == "heavybeast") {
				jackPoints += l[c].modelOption.getLabelValue("points");
			}
			else {
				otherPoints += l[c].modelOption.getLabelValue("points");
			}
		}
		if(jackPoints < 0) {
			jackPoints = 0;
		}
		return jackPoints + childPoints + otherPoints;
	};


	this.ignoreNextAdd = function() {
		this.ignoreNext = true;
	};

	
	this.add = function(id, parentId, optionId) {
		if(this.ignoreNext == true) {
			this.ignoreNext = false;
			return;
		}
		var model = getModelById(id);
		var optionPos = 0;
		if(optionId != null) {
			for(var c = 0; c < model.modelOptions.length; c++) {
				var option = model.modelOptions[c];
				if(option.id == optionId) {
					optionPos = c;
				}
			}
		}

		var workList = this.list;
		if(parentId != null) {
			var parent = this.get(parentId);
			workList = parent.listModels;
		}
		
		if(parent == null) {
			if(model.dependant) {
				var addModels = this.findModelsToAddTo(model);
				workList = addModels[0].listModels;
				parent = addModels[0];
			}
		}

		var listModel = new ListModel(model, model.modelOptions[optionPos]);
		
		workList[workList.length] = listModel;
		if(parent != null) {
			listModel.parent = parent;
		}

		this.rebuild();
		modelList.rebuild();
		
		return listModel.id;
	};

	this.remove = function(id) {
		var element = this.get(id);
		var workList = (element.parent == null)?this.list:element.parent.listModels;

		var pos = -1;
		for(var c = 0; c < workList.length; c++) {
			if(workList[c].id == id) {
				pos = c;
			}
		}
		
		workList.splice(pos,1);
		this.rebuild();
		modelList.rebuild();
	};

	this.change = function(optionId, id) {
		var listModel = this.get(id);
		
		for(var c = 0; c < listModel.model.modelOptions.length; c++) {
			var option = listModel.model.modelOptions[c];
			if(option.id == optionId) {
				listModel.modelOption = option;
			}
		}
		this.rebuild();
		modelList.rebuild();
	};

	this.move = function(id, parentId, toId) {
		var lm = this.get(id);
		
		this.remove(id);
		
		for(var a = 0; a < this.list.length; a++) {
			var la = this.list[a];
			if(la.id == toId) {
				la.listModels[la.listModels.length] = lm;
				lm.parent = la;
			}
			for(var b = 0; b < la.listModels.length; b++) {
				var lb = la.listModels[b];
				if(lb != undefined && lb.id == toId) {
					lb.listModels[lb.listModels.length] = lm;
					lm.parent = lb;
				}
			}
		}
		this.rebuild();
		modelList.rebuild();
	};

	this.get = function(id, l) {
		if(l == null) {
			l = this.list;
		}
		for(var a = 0; a < l.length; a++) {
			if(l[a].id == id) {
				return l[a];
			}
			var child = this.get(id, l[a].listModels);
			if(child != null) {
				return child;
			}
		}
	};

	this.getByModel = function(model, l) {
		if(l == null) {
			l = this.list;
		}
		for(var a = 0; a < l.length; a++) {
			if(l[a].model == model) {
				return l[a];
			}
			var child = this.getByModel(model, l[a].listModels);
			if(child != null) {
				return child;
			}
		}
	};
	
	this.getArrayByModel = function(model, l, array) {
		if(l == null) {
			l = this.list;
		}
		if(array == null) {
			array = [];
		}
		for(var a = 0; a < l.length; a++) {
			if(l[a].model == model) {
				array[array.length] = l[a];
			}
			this.getArrayByModel(model, l[a].listModels, array);
		}
		return array;
	};
	
	this.getCount = function(model, l) {
		var count = 0;
		if(l == null) {
			l = this.list;
		}
		for(var a = 0; a < l.length; a++) {
			if(l[a].model == model) {
				count++;
			}
			count += this.getCount(model, l[a].listModels);
		}
		return count;
	};

	this.rebuild = function() {
		var html = "";
		this.recalculatePoints();
		this.list.sort(modelListSorter);
		for(var c = 0; c < this.list.length; c++) {
			this.list[c].listModels.sort(modelListSorter);
			html += createListHtml(this.list[c]);
		}
		document.getElementById("list").innerHTML = html;
		currentSystem.executeOverride("rebuild");
	};
}
var armyTree = new ArmyTree();

function ModelList() {
	this.army = null;
	
	this.selectArmy = function(id) {
		if(!(typeof id == "number") && id.value != null) {
			id = id.value;
		}
		if(typeof id == "object") {
			this.army = id;
		}
		else {
			this.army = armies[parseInt(id)];
		}
		
		for(var c = 0; c < this.army.groups.length; c++) {
			var group = this.army.groups[c];
			for(var i = 0; i < group.models.length; i++) {
				var model = group.models[i];
				if(model == undefined) {
					console.debug("Model not found: ",group.name,i);
				}
				model.group = group;
				model.html = [];
				for(var o = 0; o <= model.modelOptions.length; o++) {
					model.html[o] = createOptionHtml(group, model, o);
				}
			}
		}
		armyTree.clear();

		document.getElementById("army").innerHTML = "<span class='label'>Army:</span> "+this.army.name;
	};
	
	this.rebuild = function() {
		var html = "";
			
		for(var c = 0; c < this.army.groups.length; c++) {
			html += createOptionHeader(this.army.groups[c]);   
			for(var i = 0; i < this.army.groups[c].models.length; i++) {
				
				var customResult = currentSystem.executeOverride("rebuildModel", c+","+i);
				if(customResult != null) {
					html += customResult;
				}
				else {
					var model = this.army.groups[c].models[i];

					var enable = 0;
					var FA = armyTree.allowedCount(model);
					for(var o = 0; o < model.modelOptions.length; o++) {
						if(!armyTree.canAdd(model, model.modelOptions[o], FA)) {
							break;
						}
						enable = o+1;
					}
					html += model.html[enable];
				}
			}
		}
		document.getElementById("options").innerHTML = html;
	};
}
var modelList = new ModelList();
var currentScreen = null;

function showSavePopup() {
	html = "<h1><img src='img/close.png' onclick='closePopup()'/>Save army</h1>";
	html += "<div class='leftPart'><label for='armyName'>Name:</label> <input class='text' id='armyName'><br/>";
	html += "<input value='Save' type='button' onclick='sendSave()'></div>";
	html += "</div>";
	document.getElementById("popup").innerHTML = html;
	document.getElementById("popup").style.display = "block";
}

function showLoadPopup() {
	html = "<h1><img src='img/close.png' onclick='closePopup()'/>Load army</h1><div class='scrollBox'><table>";
	var isOdd = false;
	for(var c = 0; c < savedLists.length; c++) {
		var l = savedLists[c];
		if(l != null) {
			var parts = l.format.split("|");
			var casters = "";
			var ids = (l.data != null)?l.data.split(' '):new Array();
			for(var a = 0; a < ids.length; a++) {
				if(ids[a].length > 0) {
					var modelId = ids[a].substring(1,5);
					var optionId = ids[a].substring(5,ids[a].length);
					var model = getModelById(modelId);
					if(model != null) {
						if(model.type == "caster") {
							var option = model.getOption(optionId);
							if(option != null) {
								casters += option.name+", ";
							}
						}
					}
				}
			}
			casters = casters.substring(0, casters.length-2);
			
			html += "<tr onclick='javascript:loadList("+c+")'";
			if(isOdd) html += " class='odd'";
			isOdd = !isOdd;
	
			html += "><td><img src='img/delete.png' onclick='sendDelete("+c+")'/></td>";
			html += "<td><b>"+l.name+"</b></td><td class='nowrap'>"+createNiceFormatName(parts[0],parts[1],parts[2])+"</td>";
			html += "<td class='nowrap'>"+l.faction+"</td><td>"+casters+"</td></tr>";
		}
	}
	html += "</table></div>";
	document.getElementById("popup").innerHTML = html;
	document.getElementById("popup").style.display = "block";
}

function showNewPopup() {
	html = "<h1><img src='img/close.png' onclick='closePopup()'/>New army</h1><div class='scrollBox'>";
	html += "<div class='leftPart'>";
	html += "<label for='newSystem'>System:</label><select id='newSystem' onchange='changeNewSystem()'>";
	var lastSystemCookie = getCookie("lastSystem");
	if(lastSystemCookie == null) {
		html += "<option value=''>-- please select --</option>";
	}
	for(var c=0; c<systems.length;c++) {
		var system = systems[c];
		html += "<option"+((lastSystemCookie == system.name)?" selected":"")+">"+system.name+"</option>";
	}
	html +=	"</select>";
	html += "<label for='newFaction'>Faction:</label><span id='newFactionHolder'><select id='newFaction' onchange='changeNewFaction()'></select></span>";
	html += "<label for='newSubFaction'>Sub list:</label><span id='newSubFactionHolder'><select id='newSubFaction'></select></span>";
	html += "<label for='newListSizes'>Limits:</label><span id='newListSizesHolder'><select id='newListSizes'></select></span>";
	html += "<input type='button' value='Create' id='newCreateButton' onclick='createNewArmy()' disabled/>";
	html += "<input type='button' value='Cancel' onclick='closePopup()'/></div>";
	html += "<div id='newSystemDescription' class='rightPart'></div>";
	html += "</div>";
	document.getElementById("popup").innerHTML = html;
	if(lastSystemCookie != null) {
		changeNewSystem();
		changeNewFaction();
	}
	document.getElementById("popup").style.display = "block";
}

function createNewArmy() {
	var newSystem = getSelectValue(document.getElementById('newSystem'));
	var newFaction = getSelectValue(document.getElementById('newFaction'));
	var newSubFaction = getSelectValue(document.getElementById('newSubFaction'));
	var newListSize = getSelectValue(document.getElementById('newListSizes'));
	setCookie("lastSystem", newSystem);
	setCookie("lastArmy", newFaction);
	setCookie("lastSubArmy", newSubFaction);
	setCookie("lastListSize", newListSize);
	
	for(var c=0; c < systems.length; c++) {
		var system = systems[c];
		if(system.name == newSystem) {
			currentSystem = system;
		}
	}

	for(var c=0; c < currentSystem.listSizes.length; c++) {
		var currentListSize = currentSystem.listSizes[c];
		if(currentListSize.name == newListSize) {
			selectListSize(currentListSize, false);
		}
	}

	var factionName = (newSubFaction != '-- default list --')?newSubFaction:newFaction;
	for(var c=0; c < armies.length; c++) {
		var army = armies[c];
		if(army.name == factionName) {
			modelList.selectArmy(army);
		}
	}
	
	trackEvent("faction", factionName);
	trackEvent("system", newSystem);
	closePopup();
}

function getSelectValue(sel) {
	if(sel.selectedIndex == null || sel.selectedIndex == -1) {
		return '';
	}
	else {
		return sel.options[sel.selectedIndex].text;
	}
}

var newSystem = null;
function changeNewSystem() {
	var value = getSelectValue(document.getElementById('newSystem'));
	document.getElementById('newSubFactionHolder').innerHTML = '<select id="newSubFaction"></select>';
	document.getElementById('newListSizesHolder').innerHTML = '<select id="newListSizes"></select>';
	if(value == '-- please select --') {
		document.getElementById('newFactionHolder').innerHTML = "<select id='newFaction' onchange='changeNewFaction()'></select>";
		document.getElementById('newCreateButton').disabled = true;
	}
	else {
		document.getElementById('newCreateButton').disabled = false;
		for(var c=0; c<systems.length; c++) {
			var system = systems[c];
			if(value == system.name) {
				var lastArmyCookie = getCookie("lastArmy");
				var html = "<select id='newFaction' onchange='changeNewFaction()'>";
				for(var d=0; d<system.armies.length; d++) {
					var army = system.armies[d];
					html += "<option"+((lastArmyCookie == army.name)?" selected":"")+">"+army.name+"</option>"; 
				}
				document.getElementById('newFactionHolder').innerHTML = html+"</select>";
				newSystem = system;

				var lastListSizeCookie = getCookie("lastListSize");
				var html = '<select id="newListSizes">';
				for(var d=0; d<system.listSizes.length; d++) {
					var listSize = system.listSizes[d];
					html += "<option"+((lastListSizeCookie == listSize.name)?" selected":"")+">"+listSize.name+"</option>"; 
				}
				document.getElementById('newListSizesHolder').innerHTML = html+"</select>";
				newSystem = system;
				document.getElementById('newSystemDescription').innerHTML = system.description;
			}
		}
	}
	changeNewFaction();
}

function changeNewFaction() {
//	alert(1);
	if(newSystem != null) {
//		alert(2);
		var value = getSelectValue(document.getElementById('newFaction'));
		for(var c=0; c<newSystem.armies.length; c++) {
			var army = newSystem.armies[c];
			if(army.name == value) {
//				alert(3);
				var lastSubArmyCookie = getCookie("lastSubArmy");
				html = '<select id="newSubFaction">';
				if(army.hasDefault) {
					html += "<option value=''>-- default list --</option>";
				}
				if(army.subArmies != null) {
					for(var d=0; d<army.subArmies.length;d++) {
						var subArmy = army.subArmies[d];
						html += "<option"+((lastSubArmyCookie == subArmy.name)?" selected":"")+">"+subArmy.name+"</option>"; 
					}
				}
				document.getElementById('newSubFactionHolder').innerHTML = html+"</select>";
				newArmy = army; 
			}
		}
	}
}

function showLoginPopup(isRegister) {
	var html = "<h1><img src='img/close.png' onclick='closePopup()'/>"+(isRegister?"Register":"Login")+"</h1>";
	html += "<div class='leftPart'><label for='name'>Name:</label> <input class='text' id='name'>";
	html += "<label for='password'>Password:</label> <input class='text' id='password' type='password'><br/>";
	if(isRegister) {
		html += "<input value='Register' type='button' onclick='sendLogin(true)'>";
	}
	if(!isRegister) {
		html += "<input value='Login' type='button' onclick='sendLogin(false)'></div>";
	}
	html += "</div>";
	if(isRegister) {
		html += "<div class='rightPart'><p><b>Register</b></p><p>For registration we only require an username and password. After registration the system will automatic log you in.</p></div>"
	}
	document.getElementById("popup").innerHTML = html;
	document.getElementById("popup").style.display = "block";
}

function showPrintPopup() {
	var html = "<h1><img src='img/close.png' onclick='closePopup()'/>Print Options</h1><div class='printOptions'>";
	html += "Optional Additional Remarks:<br/>";
	html += "<form name='printType'><input type='text' id='printText'/><br/>";
	html += "<br/>Type of print:<br/>";
	html += "<input type='radio' id='printOptionCombined' name='option' value='combined' checked/> List with damage grids<br/>";
	html += "<input type='radio' id='printOptionList' name='option' value='list'/> Only the list<br/>";
	html += "<input type='radio' id='printOptionGrid' name='option' value='grid'/> Only the damage grids<br/>";
	html += "<input type='radio' id='printOptionSeperate' name='option' value='seperate'/> Both the list and grids on seperate pages<br/>";
	html += "<input type='button' value='print' onclick='printList()'/>";
	html += "</div>";
	document.getElementById("popup").innerHTML = html;
	document.getElementById("popup").style.display = "block";
}

var justDeleted = false;
function loadList(c) {
	if(justDeleted == true) {
		justDeleted = false;
		return;
	}
	var l = savedLists[c];

	document.getElementById("infoLeft").value = l.name;
	for(var c = 0; c < armies.length; c++) {
		var army = armies[c];
		if(army.name == l.faction) {
			for(var s = 0; s < systems.length; s++) {
				var system = systems[s];
				for(var a = 0; a < system.armies.length; a++) {
					var testArmy = system.armies[a];
					if(testArmy.name == army.name) {
						currentSystem = system;
					}
					if(testArmy.subArmies != null) {
						for(var a2 = 0; a2 < testArmy.subArmies.length; a2++) {
							var subArmy = testArmy.subArmies[a2];
							if(subArmy.name == army.name) {
								currentSystem = system;
							}
						}
					}
				}
			}
			
			var fs = document.getElementById("formatSelect");
			var parts = l.format.split("|");
			var format = createNiceFormatName(parts[0],parts[1],parts[2]);
			selectListSize(format, false);

			modelList.selectArmy(c);
		}
	}
	
	armyTree.clear();
	var ids = l.data.split(' ');
	var parentIds = new Array();
	
	for(var c = 0; c < ids.length; c++) {
		if(ids[c].length > 0) {
			var depth = parseInt(ids[c].substring(0,1));
			var modelId = ids[c].substring(1,5);
			var optionId = ids[c].substring(5,ids[c].length);
			var parentId = (depth == 0)?null:parentIds[depth-1];
	
			var id = armyTree.add(modelId, parentId, optionId);
			parentIds[depth] = id;
		}
	}
	trackEvent("io", "load", true);
	closePopup();
}

function createNiceFormatName(name, casters, points) {
	if(name.indexOf('(') >= 0) {
		return name;
	}
	else {
		return name+" ("+casters+" caster"+((casters > 1)?"s":"")+", "+points+"pts)";
	}
}

function changeOption(modelId, id, optionId) {
	armyTree.change(optionId, id);
}


function closePopup() {
	document.getElementById("popup").style.display = "none";
}

function debug(msg) {
	if(console != undefined) {
		console.debug(msg);
	}
	else {
//		alert(msg);
	}
}

function load() {
	showScreenArmyBuilder();
	var loginCookie = getCookie("cookie");
	if(loginCookie != null && loginCookie != "" && loginCookie != "undefined|undefined" && loginCookie != "null|null") {
		var subParts = loginCookie.split("|");
		sendRelogin(subParts[0], subParts[1]);
	}
}

function getCookie(name) {
	var parts = document.cookie.split("; ");
	for(var c = 0; c < parts.length; c++) {
		var subParts = parts[c].split("=");
		if(subParts[0] == name) {
			return subParts[1];
		}
	}
}

function setCookie(name, value) {
	var myDate=new Date();
	myDate.setDate(myDate.getDate()+90); // 3 months
	document.cookie = name+"="+value+"; path=/;expires="+myDate.toGMTString();
}

function resetLogin(resetCookie) {
	document.getElementById("navLogin").style.display = "inline";
	document.getElementById("navLogout").style.display = "none";
	document.getElementById("navSaveLoad").style.display = "none";
	document.getElementById("message").innerHTML = "Welcome to Forward Kommander";
	if(resetCookie) {
		document.cookie = setCookie("cookie", "");
		id = undefined;
		name = undefined;
		cookie = undefined;
		savedLists = new Array();
	}
	if(currentScreen != "army builder" && currentScreen != "help") {
		showScreenArmyBuilder();
	}
}

function selectListSize(newListSize, rebuild) {
	if(newListSize.selectedIndex != null) {
		newListSize = getSelectValue(newListSize);
	}
	if(newListSize.name != null) {
		listSize = newListSize;
	}
	else {
		for(var c=0; c<currentSystem.listSizes.length; c++) {
			var ls = currentSystem.listSizes[c];
			if(ls.name == newListSize) {
				listSize = ls;
			}
		}
	}
	if(rebuild == null || rebuild == true) {
		armyTree.rebuild();
		modelList.rebuild();
	}
	html = "<span class='label'>Size:</span><select id='formatSelect' onchange='selectListSize(this)'>";
	for(var c = 0; c < currentSystem.listSizes.length; c++) {
		var ls = currentSystem.listSizes[c];
		html += "<option"+((ls.name == listSize.name)?" selected":"")+">"+ls.name+"</option>";
	}
	html += "</select>";

	trackEvent("listSize", listSize.name);
	document.getElementById("size").innerHTML = html;
}


function createOptionHtml(group, model, enabled) {
	var html = "<div id='"+model.id+"' class='";
	if(enabled == 0) {
		html += "disabled";
	}
	else {
		html += "enabled' onclick='armyTree.add(\""+model.id+"\")";
	}
	html += "'><span class='name'>"+model.name+"</span>";
	
	if(enabled) {
		html += "<span class='add'>&gt;&gt;</span>";
	}
	
	var fa = model.fa;
	if(fa != "C" && fa != "U" && modelList.army.advantage == "+1FA") {
		fa++;
	}
	html += "<span class='fa'>"+((group.max == 999)?fa:"&nbsp;")+"</span>";

	html += createIcons(model, null, enabled, "armyTree.add", "armyTree.ignoreNextAdd()");

	html += "</div>";
	return html;
}

function createIcons(model, option, enabled, onclick, onclickDisabled, id) {
	var html = "";
	for(var c = model.modelOptions.length-1; c >= 0 ; c--) {
		var mo = model.modelOptions[c];
		var pnts = Math.abs(mo.getLabelValue("points"));
		
		var isDisabled = (c >= enabled);
		var isSelected = (mo != null && option != null && option.id == mo.id);
		if(isSelected && onclick.indexOf('changeOption') != -1) {
			html += "<span class='"+((pnts>=100)?"selectedHuge":(pnts>=10)?"selectedBig":"selected")+"'>";
		}
		html += "<span class='option"+((pnts>=100)?" huge":(pnts>=10)?" big":"")+((model.type == 'caster')?" caster":"")+((isDisabled)?(" disabled"):" enabled")+((isSelected)?(" selected"):"")+"'";
		if(id != null) {
			html += " id='lm_"+id+"_"+c+"'";
		}
		if(!isDisabled) {
			html += " onclick='"+onclick+"(\""+model.id+"\",";
			html += (id != null)?id:null;
			html += ",\""+mo.id+"\");";
			if(onclickDisabled != null) {
				html += "armyTree.ignoreNextAdd();";
			}
			html += "'";
		}
		else if(onclickDisabled != null) {
			html += " onclick='"+onclickDisabled+";'";
		}
		html += " style='background-image: url(img/type/"+mo.id+((isDisabled)?"_d":"")+".gif); background-position: 1px 1px;'>"+pnts+"</span>";
		if(isSelected && onclick.indexOf('changeOption') != -1) {
			html += "</span>";
		}

	}
	return html;
}

function createOptionHeader(group) {
	var html = "<div class='group'";
	html += " style='background-color: "+group.colors[1]+";color:"+group.colors[0];
	html += "'><span class='name'>"+group.name+((group.max != 999)?(" (FA: "+group.max+")"):"")+"</span></div>";
	return html;
}

function createListHtml(lm, parentLm, depth) {
	if(depth == null) {
		depth = 0;
	}
	var html = "<div class='depth"+depth+"'>";
	html += "<span class='name'>";
	html += lm.modelOption.name;
	html += "</span>";
	
	  
	html += "<span class='del'><img src='img/close.png' onclick='armyTree.remove("+lm.id+")'/></span>";
	var enabled = 99;
	for(var c = 1; c < lm.model.modelOptions.length; c++) {
		if(enabled == 99 && armyTree.getLabelValue("points")-lm.modelOption.getLabelValue("points")+lm.model.modelOptions[c].getLabelValue("points") > listSize.get("points")) {
			enabled = c;
		}
	}
	html += createIcons(lm.model, lm.modelOption, enabled, "changeOption", null, lm.id);

	if(parentLm != null) {
		var addTo = armyTree.findModelsToAddTo(lm.model, null, parentLm);
		if(addTo.length > 1) {
			for(var c = 0; c < addTo.length;c++) {
				if(addTo[c].id == parentLm.id) {
					if(c > 0 && addTo[c-1].id != parentLm.id) {
						html += "<span class='move'><img src='img/up.png' onclick='armyTree.move("+lm.id+","+parentLm.id+", "+addTo[c-1].id+")'/></span>";
					}
					if(c < addTo.length-1 && addTo[c+1].id != parentLm.id) {
						html += "<span class='move'><img src='img/down.png' onclick='armyTree.move("+lm.id+","+parentLm.id+", "+addTo[c+1].id+")'/></span>";
					}
				}
			}
		}
	}
	
	
	html += "</div>";

	for(var s = 0; s < lm.listModels.length; s++) {
		html += createListHtml(lm.listModels[s], lm, depth+1);
	}

	return html;
}
function trackEvent(type, subtype) {
	if(pageTracker != null) {
//		console.debug("tracking: ",type, subtype);
		pageTracker._trackEvent(type, subtype);
	}
}

function checkLoggedIn(part) {
	var loggedIn = cookie != null;
	if(!loggedIn) {
		alert("To access the "+part+" you must be logged in. To login or register use the yellow box at the top of the screen.")
	}
	return loggedIn;
}

function showScreenCollection() {
	if(checkLoggedIn("collection manager")) {
		document.getElementById("navArmyBuilder").style.display = "inline";
		document.getElementById("navCollection").style.display = "none";
		document.getElementById("navBuilder").style.display = "none";
		
		currentScreen = "collection";
		var leftHtml = "<table id='faction'>";
		var add = 0;
		for(var s = 0; s < systems.length; s++) {
			var system = systems[s];
			leftHtml += "<tr><th>"+system.name+":</th><th>Owned</th><th>Painted</th><th style='width:50px'></th></tr>";
			
			for(var c = 0; c < system.factions.length; c++) {
				var f = system.factions[c];
				leftHtml += "<tr onclick='selectCollectionFaction("+(c+add)+")' "+((c%2==1)?"class='odd'":"")+">";
				leftHtml += "<td>"+f.name+"</td>";
				leftHtml += "<td id='factionOwning_"+(c+add)+"'>0</td>";
				leftHtml += "<td id='factionPainted_"+(c+add)+"'></td>";
				
				leftHtml += "<td><div id='barO_"+(c+add)+"' style='display:none; width:50px; height: 15px; border: 1px solid "+f.colors[1]+"; background-color:"+f.colors[0]+"'><div id='barI_"+(c+add)+"' style='width:16px; height: 15px;background-color:"+f.colors[1]+"'></div></td>";
				leftHtml += "</tr>";
			}
			add+=system.factions.length;
		}
		leftHtml += "</table>";
		document.getElementById("infoLeft").innerHTML = '';
		document.getElementById("left").innerHTML = leftHtml;
		document.getElementById("infoRight").innerHTML = '';
	
		var selectedFaction = false;
		for(var c = 0; c < factions.length; c++) {
			var f = factions[c];
			var own = 0;
			var painted = 0;
			if(f.collection != null && f.collection != "") {
				var data = f.collection.split("|");
				for(var x = 0; x < data.length; x+=3) {
					own += parseInt(data[x]);
					painted += parseInt(data[x+1]);
				}
				if(!selectedFaction) {
					selectCollectionFaction(c);
					selectedFaction = true;
				}
			}
			updateCollectionCount(c, own, painted);
		}
		if(!selectedFaction) {
			selectCollectionFaction(0);
		}
	}
}

function showScreenArmyBuilder() {
	document.getElementById("navArmyBuilder").style.display = "none";
	document.getElementById("navCollection").style.display = "inline";
	document.getElementById("navBuilder").style.display = "inline";
	
	currentScreen = "army builder";
	document.getElementById("infoLeft").innerHTML = '<div class="armyInfo"><div id="army"></div><div id="size"></div></div>';
	document.getElementById("left").innerHTML = '<div id="options"></div>';
	document.getElementById("infoRight").innerHTML = '<div id="info"></div>';
	document.getElementById("right").innerHTML = '<div id="list"></div>';
	
	showNewPopup();
}

function selectCollectionFaction(nr) {
	faction = factions[nr];
	var rightHtml = "<div id='collection'><table>";
	modelNames = new Array();
	for(var c = 0; c < models.length; c++){
		var m = models[c];
		if(m.id.indexOf(faction.prefix) == 0) {
			for(var d = 0; d < m.modelOptions.length; d++){
				if(m.modelOptions[d].realModels != null) {
					for(var e = 0; e < m.modelOptions[d].realModels.length; e+=2){
						addModelName(m.modelOptions[d].realModels[e+1], m.name, modelTypes[m.type]);
					}
				}
				else {
					addModelName(m.modelOptions[d].name, m.name, modelTypes[m.type]);
				}
			}
		}
	}
	modelNames.sort(typeKeyNameSorter);
	
	var data = faction.collection;
	var painted = new Array();
	var owned = new Array();
	if(data != null) {
		var x = data.split("|");
		for(var c = 0; c < x.length; c+=3) {
			owned[x[c+2]] = parseInt(x[c]);
			painted[x[c+2]] = parseInt(x[c+1]);
		}
	}
	
	var oldType = null;
	for(m in modelNames) {
		if(modelNames[m].type != oldType) {
			rightHtml += "<tr style='background-color: "+faction.colors[1]+";color:"+faction.colors[0];
			rightHtml += "'><th>"+faction.name+" "+modelTypeNames[modelNames[m].type]+"</th><th class='numbers'>Owned</th><th class='numbers'>Painted</th></tr>";
			oldType = modelNames[m].type;
		}
		var name = modelNames[m].name;
		var owning = (owned[name] == null)?0:owned[name];
		var painting = (painted[name] == null)?0:painted[name];
		rightHtml += "<tr "+((m%2==1)?"class='odd'":"")+"><td id='col_"+m+"'>"+name+"</td>";
		rightHtml += "<td><span id='own_"+m+"'>"+owning+"</span><a href='javascript:add(\"own\","+m+")'><img src='img/add.png' width='16' height='16'/></a><a href='javascript:substract(\"own\","+m+")'><img src='img/delete.png'/></a></td>";
		rightHtml += "<td><span id='paint_"+m+"'>"+painting+"</span><a href='javascript:add(\"paint\","+m+")'><img src='img/add.png' width='16' height='16'/></a><a href='javascript:substract(\"paint\","+m+")'><img src='img/delete.png'/></a></td></tr>";
	}
	faction.size = modelNames.length;
	rightHtml += "</table></div>";
	document.getElementById("right").innerHTML = rightHtml;
	
	recalculateCollection(false);
}

var modelNames = undefined;
function addModelName(name, key, type) {
	for(var c = 0; c < modelNames.length; c++) {
		if(modelNames[c].name == name) {
			return;
		}
	}
	modelNames[modelNames.length] = {'name':name, 'key':key, 'type':type};
}

function add(type, id) {
	var span = document.getElementById(type+"_"+id);
	span.innerHTML = parseInt(span.innerHTML)+1;

	var own = document.getElementById("own_"+id);
	var paint = document.getElementById("paint_"+id);
	if(parseInt(own.innerHTML) < parseInt(paint.innerHTML)) {
		own.innerHTML = paint.innerHTML;
	}
	recalculateCollection(true);
}

function substract(type, id) {
	var span = document.getElementById(type+"_"+id);
	if(parseInt(span.innerHTML) > 0) {
		span.innerHTML = parseInt(span.innerHTML)-1;
	}
	var own = document.getElementById("own_"+id);
	var paint = document.getElementById("paint_"+id);
	if(parseInt(own.innerHTML) < parseInt(paint.innerHTML)) {
		paint.innerHTML = own.innerHTML;
	}
	recalculateCollection(true);
}

function recalculateCollection(send) {
	for(var c = 0; c < factions.length; c++) {
		if(factions[c] == faction) {
			var owning = 0;
			var painted = 0;
			var data = "";
			for(var fc = 0; fc < faction.size; fc++) {
				var o = parseInt(document.getElementById("own_"+fc).innerHTML);
				var p = parseInt(document.getElementById("paint_"+fc).innerHTML);
				if(o > 0) {
					owning += o;
					painted += p;
					if(data.length > 0) {
						data += "|";
					}
					data += o+"|"+p+"|"+document.getElementById("col_"+fc).innerHTML;
				}
			}
			
			updateCollectionCount(c, owning, painted);

			if(send) {
				sendCollection(faction.name, data);
			}
			
			faction.collection = data;
		}
	}
}

function updateCollectionCount(c, owning, painted) {
	document.getElementById("factionOwning_"+c).innerHTML = owning;
	if(owning > 0) {
		var percent = parseInt(painted*100/owning);
		document.getElementById("factionPainted_"+c).innerHTML = percent+"%";
		document.getElementById("barO_"+c).style.display = 'block';
		document.getElementById("barI_"+c).style.width = parseInt(percent/2)+"px"; 
	}
	else {
		document.getElementById("barO_"+c).style.display = 'none';
		document.getElementById("factionPainted_"+c).innerHTML = "";
	}
}

function clipboard() {
	html = "<h1><img src='img/close.png' onclick='closePopup()'/>Clipboard options</h1><div class='printOptions'>";
	html += "Clipboard options:<br/>";
	html += "<input type='radio' name='option' onclick='clipboardOptions(\"plain\")' checked/>Plain text<br/>";
	html += "<input type='radio' name='option' onclick='clipboardOptions(\"bb\")'/>BB Code<br/>";
	html += "<input type='radio' name='option' onclick='clipboardOptions(\"html\")'/>Html Code<br/>";
	html += "<div id='clipboard'>Blaat</div>";
	html += "Select the data above and copy it to clipboard.</div>";
	document.getElementById("popup").innerHTML = html;
	document.getElementById("popup").style.display = "block";
	clipboardOptions('plain');
}

var clipboardStuff = new Array();
clipboardStuff['html_newline'] = "&lt;br/&gt;<br/>";
clipboardStuff['bb_newline'] = "<br/>";
clipboardStuff['plain_newline'] = "<br/>";
clipboardStuff['html_boldstart'] = "&lt;b&gt;<b>";
clipboardStuff['bb_boldstart'] = "[b]<b>";
clipboardStuff['plain_boldstart'] = "<b>";
clipboardStuff['html_boldend'] = "</b>&lt;/b&gt;";
clipboardStuff['bb_boldend'] = "</b>[/b]";
clipboardStuff['plain_boldend'] = "</b>";

function clipboardOptions(type) {
	printTierFree = new Array();
	var code = "System: "+ clipboardStuff[type+'_boldstart'] + currentSystem.name+clipboardStuff[type+'_boldend']+clipboardStuff[type+'_newline'];
	code += "Faction: "+ clipboardStuff[type+'_boldstart'] + modelList.army.name+clipboardStuff[type+'_boldend']+clipboardStuff[type+'_newline'];
	code += document.getElementById("info").innerHTML.replace(/<div id=\"tiers\"><\/div>/g, "")
													 .replace(/<div.*?>/g, "")
													 .replace(/<\/div>/g, clipboardStuff[type+'_boldend']+clipboardStuff[type+'_newline'])
													 .replace(/<span.*?>/g, "")
													 .replace(/<\/span>/g, "")
													 .replace(/<img.*?>/g, "")
													 .replace(/: /g, ": "+clipboardStuff[type+'_boldstart'])
													 .replace(/<!--/g, "")
													 .replace(/-->/g, "");
	for(var c = 0; c < armyTree.list.length; c++) {
		var lm = armyTree.list[c];
		code += clipboardOption(lm, 0, type);
	}
	document.getElementById("clipboard").innerHTML = code;
}

function clipboardOption(lm, depth, type) {
	var code = "";
	for(var c = 0; c < depth; c++) {
		code += "* ";
	}
	code += lm.modelOption.name;
	var points = Math.abs(lm.modelOption.getLabelValue("points"));
	if(isFreeBecauseOfTier(lm.model)) {
		points = 0;
	}
	if(isPointReducedBecauseOfTier(lm.model)) {
		points -= 1;
	}

	code += " "+clipboardStuff[type+'_boldstart'];
	code += "("+((lm.modelOption.getLabelValue("points") < 0)?"*":"")+points+"pts)";
	code += clipboardStuff[type+'_boldend'];
	code += clipboardStuff[type+'_newline']; 
	for(var c = 0; c < lm.listModels.length; c++) {
		code += clipboardOption(lm.listModels[c], depth+1, type);
	}
	return code;
}


//Register global error handler
window.onerror = function(message, uri, line) {
  var fullMessage = message + "\n at " + uri + ": " + line
  trackEvent("js_error", fullMessage);
  // Let the browser take it from here
  return false                      
};


var xmlHttp;
var id;
var name;
var cookie;

function sendLogin(register, name, password) {
	if(name == null) {
		name = document.getElementById("name").value;
		password = document.getElementById("password").value;
	}
	document.getElementById("message").innerHTML = "Welcome to Forward Kommander. Logging in, please wait...";
	closePopup();
	sendRequest("login","register="+register+"&name="+escape(name)+"&password="+escape(password));
	trackEvent("login", "manual", false);
}

function sendRelogin(id, cookie) {
	document.getElementById("message").innerHTML = "Welcome to Forward Kommander. Logging in, please wait...";
	sendRequest("login","register=false&id="+id+"&cookie="+cookie);
	trackEvent("login", "auto", false);
}

function sendSave() {
	var armyName = document.getElementById("armyName").value;
	if(armyName == '') {
		alert("Please enter an army name first!");
	} else {
		var format = listSize.name+"|"+listSize.get("casters")+"|"+listSize.get("points");
		var faction = modelList.army.name;
		var data = buildSaveData(armyTree.list);
		data = data.substring(0, data.length-1); // trim of trailing space
		if(data.length == 0) {
			alert("You can not save an empty list.")
		}
		else {
			closePopup();
			sendRequest("save","id="+id+"&cookie="+cookie+"&armyName="+escape(armyName)+"&format="+escape(format)+"&faction="+escape(faction)+"&data="+escape(data));
			
			var found = false;
			var savedList = new SavedList(armyName, format, faction, data, 1);
			for(var c = 0; c < savedLists.length && !found; c++) {
				if(savedLists[c] != null && savedLists[c].name == armyName) {
					savedLists[c] = savedList;
					found = true;
				}
			}
			if(!found) {
				savedLists[savedLists.length] = savedList; 
				updateLoginArea();
			}
			trackEvent("io", "save", true);
		}
	}
}

function sendCollection(faction, data) {
	sendRequest("col","id="+id+"&cookie="+cookie+"&faction="+faction+"&data="+escape(data));
}

function sendDelete(pos) {
	if(confirm("Are you sure you want to delete this army?")) {
		var armyName = savedLists[pos].name;
		sendRequest("delete","id="+id+"&cookie="+cookie+"&armyName="+escape(armyName));
		savedLists[pos] = null;
		showLoadPopup();
		justDeleted = true;
		closePopup();
		updateLoginArea();
	}
}

function sendMessages(parentId) {
//	sendRequest("message","parentId="+((parentId == null)?"":parentId));
}

function sendMessage(parentId, messageId, subject, body) {
//	sendRequest("messages","id="+id+"&cookie="+cookie+"&parentId="+((parentId == null)?"":parentId)+"&messageId="+((messageId == null)?"":messageId)+"&subject="+escape(subject)+"&body="+escape(body));
}

function buildSaveData(l, depth) {
	var data = "";
	if(depth == null) depth = 0;
	for(var c = 0; c < l.length; c++) {
		data += depth+l[c].model.id+l[c].modelOption.id+" ";
		data += buildSaveData(l[c].listModels, depth+1);
	}
	return data;
}

function sendRequest(request, parameters) {
	try {
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e) {
		// Internet Explorer
		try {
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e) {
			try {
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e) {
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	xmlHttp.onreadystatechange=stateChanged;;
	xmlHttp.open('POST', "/"+request, true);
	xmlHttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlHttp.setRequestHeader("Content-length", parameters.length);
    xmlHttp.setRequestHeader("Connection", "close");
    xmlHttp.send(parameters);
}


function stateChanged() {
	if(xmlHttp.readyState==4) {
  		var xml=xmlHttp.responseXML.documentElement;
  		var requestType = xml.nodeName;
  		
  		switch(requestType) {
  		case "login": handleLogin(xml); break;
 		case "save": handleSave(xml); break;
 		case "col": handleCollection(xml); break;
 		case "delete": handleDelete(xml); break;
 		case "users": handleTestUsers(xml); break;
 		case "message": handleMessage(xml); break;
 		case "messages": handleMessages(xml); break;
	  	default: 
			loginResultHandler(false, "no handler for request with type: "+requestType);
	  		break;
  		}
 	}
}

function handleLogin(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
			loginResultHandler(false, subXml.firstChild.nodeValue);
			resetLogin(true);
		}
		else if(subXml.nodeName == "id") {
			id = subXml.firstChild.nodeValue;
		}
		else if(subXml.nodeName == "name") {
			name = subXml.firstChild.nodeValue;
			loginResultHandler(true);
		}
		else if(subXml.nodeName == "cookie") {
			cookie = subXml.firstChild.nodeValue;
		}
		else if(subXml.nodeName == "army") {
			var armyName = "";
			var format = "";
			var faction = "";
			var data = "";
			var version = "0";
			for(var c = 0; c < subXml.childNodes.length; c++) {
				var subSubXml = subXml.childNodes[c];
				if(subSubXml.nodeName == "id") {
					armyId = subSubXml.firstChild.nodeValue;
				}
				if(subSubXml.nodeName == "name") {
					armyName = subSubXml.firstChild.nodeValue;
				}
				else if(subSubXml.nodeName == "format") {
					format = subSubXml.firstChild.nodeValue;
				}
				else if(subSubXml.nodeName == "faction") {
					faction = subSubXml.firstChild.nodeValue;
				}
				else if(subSubXml.nodeName == "data") {
					if(subSubXml.firstChild != null) {
						data = subSubXml.firstChild.nodeValue;
					}
				}
				else if(subSubXml.nodeName == "version") {
					version = subSubXml.firstChild.nodeValue;
				}
			}
			if(version == 0) {
				var casters = 0;
				var firstCaster = null;
				var originalCasterId = null;
				var ids = (data != null)?data.split(' '):new Array();
				for(var a = 0; a < ids.length; a++) {
					if(ids[a].length > 0) {
						var modelId = ids[a].substring(1,5);
						var optionId = ids[a].substring(5,ids[a].length);
						var model = getModelById(modelId);
						if(model != null) {
							if(model.type == "caster") {
								var option = model.getOption(optionId);
								casters++;
								if(firstCaster == null) {
									firstCaster = option.name;
									originalCasterId = modelId;
								}
							}
						}
					}
				}
				if(casters == 1) {
					for(var c = 0; c < armies.length; c++) {
						var army = armies[c];
						if(army.groups.length > 0) {
							var modelOptions = army.groups[0].models[0].modelOptions;
							if(modelOptions.length == 1) {
								if(modelOptions[0].name == firstCaster) {
									faction = army.name;
									data = data.replace(originalCasterId, army.groups[0].models[0].id);
								}
							}
						}
					}
				}
			}
			savedLists[savedLists.length] = new SavedList(armyName, format, faction, data, version);
		}
		else if(subXml.nodeName == "collection") {
			var faction = "";
			var data = "";
			for(var c = 0; c < subXml.childNodes.length; c++) {
				var subSubXml = subXml.childNodes[c];
				if(subSubXml.nodeName == "faction") {
					faction = subSubXml.firstChild.nodeValue;
				}
				else if(subSubXml.nodeName == "data") {
					if(subSubXml.firstChild != null) {
						data = subSubXml.firstChild.nodeValue;
					}
				}
			}
			for(var c = 0; c < factions.length; c++) {
				if(factions[c].name == faction) {
					factions[c].collection = data;
				}
			}
		}
	}
	
	if(name != null && name != '') {
		updateLoginArea();
	}
}

function loginResultHandler(ok, msg) {
	if(!ok) {
		alert(msg);
	}
}


function updateLoginArea() {
	if(name != null && name != 'undefined') {
		document.getElementById("message").innerHTML = "Welcome back "+name.substring(0,1).toUpperCase()+name.substring(1).toLowerCase()+"<br/>";
		document.getElementById("navLogin").style.display = "none";
		document.getElementById("navLogout").style.display = "inline";
		document.getElementById("navSaveLoad").style.display = "inline";
		
		setCookie("cookie",id+"|"+cookie);
	}
}

function handleSave(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
			alert(subXml.firstChild.nodeValue);
		}
	}
}

function handleDelete(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
			alert(subXml.firstChild.nodeValue);
		}
	}
}

function handleCollection(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
//			debug(subXml.firstChild.nodeValue);
		}
	}
}

function handleMessage(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
			alert(subXml.firstChild.nodeValue);
		}
	}
}

function handleMessages(xml) {
	for(var s = 0; s < xml.childNodes.length; s++){
		var subXml = xml.childNodes[s];
		
		if(subXml.nodeName == "message") {
			alert(subXml.firstChild.nodeValue);
		}
	}
}
/* TODO: 
 * check on IE and on letter size
 */

var printCount = 1;
var MAX_PAGE_HEIGHT = 750;
var printTierFree;
function printList() {
	closePopup();
	printTierFree = new Array();
	
	var html = "<div class='printFooter'><img src='favicon.png' align='top'/> www.forwardkommander.com</div>";
	html += "<div class='printHeader' id='print_0'>";
	html += "System: "+ currentSystem.name;
	html += "<br/>Faction: "+ modelList.army.name;
	html += document.getElementById("info").innerHTML.replace(/<span.*?>/g, "<br/>").replace(/<\/span>/g, "").replace(/Pnts/g, "Points");
	
	var text = document.getElementById("printText").value;
	if(text != null && text != "") {
		html += "<br/> Remarks: "+text;
	}
	html += "</div>";
	
	var passes = new Array();
	if(document.getElementById("printOptionCombined").checked) {
		passes[0] = "combined";
	}
	else if(document.getElementById("printOptionList").checked) {
		passes[0] = "list";
	}
	else if(document.getElementById("printOptionGrid").checked) {
		passes[0] = "grid";
	}
	else if(document.getElementById("printOptionSeperate").checked) {
		passes[0] = "list";
		passes[1] = "grid";
	}

	printCount = 1;
	var passText = "";
	for(var p = 0; p < passes.length; p++) {
		if(p > 0) {
			html += "<div class='pageBreak'></div>";
		}
		for(var c = 0; c < armyTree.list.length; c++) {
			html += createListPrint(armyTree.list[c], 0, passes[p]);
		}
		passText += passes[p]+((p!=passes.length-1)?"_":"");
	}	
	document.getElementById("printArea").style.display = "block";
//	console.debug(html);
	document.getElementById("printArea").innerHTML = html;
	
	var height = 0;
	var gridHeights = new Array();
	for(var c = 0; c < printCount; c++) {
		var printDiv = document.getElementById("print_"+c);
		var thisHeight = printDiv.clientHeight;  // or offsetHeight if this fails in IE
		var pass = (printDiv.className.indexOf("_") != -1)?printDiv.className.substring(printDiv.className.indexOf("_")+1):null;
//		console.debug("this: "+thisHeight+"   page:"+height+" "+pass);

		var useForHeight = true;
		if(pass == 'grid') {
			gridHeights[gridHeights.length++] = thisHeight;
			useForHeight = (gridHeights.length == 4) || (c == printCount-1); 
			if(useForHeight) {
				for(var h = 0; h < gridHeights.length-1; h++) {
					if(gridHeights[h] > thisHeight) {
						thisHeight = gridHeights[h];
					}
				}
				for(var h = -gridHeights.length+1; h <= 0; h++) {
					document.getElementById("print_"+(c+h)).style.height = (thisHeight+3)+"px";
				}
				gridHeights = new Array();
			}
		}
		
		if(useForHeight) {
			if(thisHeight + height > MAX_PAGE_HEIGHT) {
				height = thisHeight;
				if(pass != "grid") {
					printDiv.style.pageBreakBefore = "always";
				}
				else {
					printDiv.style.pageBreakAfter = "always";
				}
			}
			else {
				height += thisHeight;
			}
		}
	}
	trackEvent("print", passText, true);
	setTimeout("window.print()",1000);
	
}

function createListPrint(lm, depth, pass) {
	if(depth == null) {
		depth = 0;
	}
	var html = "";
	if(pass != "grid" || lm.modelOption.hitpoints != null) {
		html += "<div class='printItem pi_"+pass+"' id='print_"+(printCount++)+"'>";
		html += "<div class='name'>";
		if(pass !== "grid") {
			if(depth == 1) {
				html += "* ";
			}
			if(depth == 2) {
				html += "&nbsp;&nbsp;* ";
			}
		}
		if(pass != "grid") {
			html += lm.modelOption.name;
			var points = Math.abs(lm.modelOption.getLabelValue("points"));

			if(isFreeBecauseOfTier(lm.model)) {
				points = 0;
			}
			if(isPointReducedBecauseOfTier(lm.model)) {
				points -= 1;
			}
			html += " ("+((lm.modelOption.getLabelValue("points") < 0)?"*":"")+points+"pts)";
		}
		else {
			var name = lm.modelOption.name;
			if(name.indexOf("(") != -1) {
				name = name.substring(0,name.indexOf("(")-1);
			}
			html += name;
		}
		html += "</div>";
		
		if(pass == "combined" || pass == "grid") {
			html += "<div class='hitpoints'>";
			html += renderHitpoints(lm.modelOption.hitpoints, pass);
			html += "</div>";
		}
		if(pass != "grid" || printCount%5 == 1) {
			html += "<div class='clear'></div>";
		}
		html += "</div>"; // end print item
	}
	for(var s = 0; s < lm.listModels.length; s++) {
		html += createListPrint(lm.listModels[s], depth+1, pass);
	}
	return html;
}

function renderHitpoints(hp, pass) {
	var render = "";
	if(hp != null) { 
		if(hp instanceof Array) {
			if(hp.length == 3) {
				render += "<p class='hpvalue hpsize_11'>";
				// 0 1 2 3 4 5 6 7 8 9 0
				// b b             l h h
				for(var col = 0; col < 6; col++) {
					for(var row = 0; row < 11; row++) {
						var img = "empty";
						if(row == 0) {
							img = "beast_"+col;
						}
						else if(row == 1) {
							img = col+1;
						}
						else if(row < 8) {
							var isHp = (2+((7-row)*2))+((col%2==0)?0:1) < hp[parseInt(col/2)];
							if(isHp) {
								img = "o";
							}
						}
						else if(row == 8) {
							img = (col%2==0)?"down":"up";
						}
						else {
							img = "o_"+((col%2==0)?"top":"bottom");
						}

						render += "<img src='img/hp/"+img+".gif'/>";
					}
					render += "<br/>"
				}
				render += "</p>";
			}
			else {
				for(var c = 0; c < hp.length; c+=2) {
					render += renderHitpoints(hp[c+1], pass);
					render += "<p class='hplabel'>"+hp[c]+"</p>";
				}
			}
		}
		else if((typeof hp) == "string") {
			var hpsize = (hp.length < 6)?hp.length:6;
			render += "<p class='hpvalue hpsize_"+hpsize+"'>";
			for(var c= 0; c < hp.length; c++) {
				var chr = (hp.charAt(c) != '.')?hp.charAt(c):' ';
				render += "<img src='img/hp/";
				if(chr == '.' || chr == ' ') render += "white";
				else if(chr == 'x') render += "black";
				else render += chr;
				render += ".gif'/>"
				if(c%6 == 5) render += "<br/>"
			}
			render += "</p>"
		}
		else {
			render += "<p class='hpvalue hpsize_"+hp+"'>";
			for(var c = 0; c < hp; c++) {
				var isGrey = (pass == 'grid')?(c%5==0):((hp-c)%5==0);
				render += "<img src='img/hp/"+(isGrey?"grey":"white")+".gif'/>";
			}
			render += "</p>"
		}
	}
	return render;
}
function addWMHTierArmy(army, colors, name) {
	var groups = [];
	try {
	var modelIds = army.tiers[0].typeParam.split(' ');
	} catch(e) {
		console.debug(army.name);
		console.debug(army.tiers[0].typeParam);
	}
	for(var c=0; c<modelIds.length; c++) {
		var id = modelIds[c];
		var model = getModelById(id);
		if(model == null || model == undefined) {
			console.debug('Model not found', id);
		}
		var type = model.type;
		if(groups[model.type] == null) {
			groups[model.type] = new ArmyGroup(name+" "+type.charAt(0).toUpperCase() + type.slice(1)+"s", colors);
			army.groups.push(groups[model.type]);
		}
		groups[model.type].models.push(model);
	}
	
	addArmy(army);
	return army;
}

function wmhRedrawPoints() {
	if(listSize == null) {
		return '';
	}
//	wmhRecalcPoints();
	var html = '';
	var tierInfo = wmhRecalculateTiers();
	armyTree.addLabelValue("points", -freeTierPoints);
	var errorCasters = (armyTree.getLabelValue("casters") > listSize.get("casters"));
	html += "<div"+((errorCasters)?" class='error'":"")+"><span class='label'>Casters:</span> "+armyTree.getLabelValue("casters")+"/"+listSize.get("casters")+"</div>";

	var errorPoints = (armyTree.getLabelValue("points") > listSize.get("points"));
	html += "<div"+((errorPoints)?" class='error'":"")+"><span class='label'>Points:</span> "+armyTree.getLabelValue("points")+"/"+listSize.get("points")+"</div>";

	html += "<div id='tiers'>"+tierInfo+"</div>";
	document.getElementById("info").innerHTML = html;
}

function wmhRecalcPoints() {
	var addWarcasterPoints = 0;
	for(var c=0; c<armyTree.list.length; c++) {
		var listModel = armyTree.list[c];
		if(listModel.model.type == "caster") {
			var warjackPoints = 0;
			for(var d=0; d< listModel.listModels.length;d++) {
				var subListModel = listModel.listModels[d];
				if(subListModel.model.type == "lightjack" || subListModel.model.type == "heavyjack" || subListModel.model.type == "lightbeast" || subListModel.model.type == "lesserbeast" || subListModel.model.type == "heavybeast") {
					warjackPoints += subListModel.modelOption.getLabelValue("points");
				}
			}
			if(warjackPoints < -listModel.modelOption.getLabelValue("points")) {
				armyTree.addLabelValue("points", -listModel.modelOption.getLabelValue("points") - warjackPoints);
			}
		}
	}
//	armyTree.addLabelValue("points", -freeTierPoints);
}

function wmhRebuildModel(c, i) {
	var model = modelList.army.groups[c].models[i];
	// if tier list had this element use tier html
	var isTierModel = false;
	for(var t = 0; t < tierModels.length; t++) {
		if(tierModels[t] == model.id) {
			isTierModel = true;
			break;
		}
	}

	if(isTierModel) {
		return model.html["TIER"];
	}
	else {
		var enable = 0;
		var FA = armyTree.allowedCount(model);
		if(isFreeBecauseOfTier(model) && model.fa != 'C') {
			FA = parseInt(FA)+1;
//			this.points = 0;
		}
		for(var o = 0; o < model.modelOptions.length; o++) {
			if(!armyTree.canAdd(model, model.modelOptions[o], FA)) {
				break;
			}
			enable = o+1;
		}
		return model.html[enable];
	}
}


var currentTier = 0;
var freeTierPoints = 0;

var tierModels = new Array();

function wmhRecalculateTiers() {
	tierModels = new Array();
	currentTier = 0;
	freeTierPoints = 0;
	if(modelList.army.tiers != null) {
		var tierHtml = "<span class='label'>Tiers:</span> ";
		var hasCurrentTier = true;
		for(var count = 0; count < modelList.army.tiers.length; count++) {
			var tier = modelList.army.tiers[count];
			if(hasCurrentTier) {
				hasCurrentTier = tier.hasTier();
				if(hasCurrentTier) {
					currentTier = count+1;
					tier.preprocess(tier.bonus, tier.bonusParam);
					tier.preprocess(tier.bonus2, tier.bonus2Param);
				}
			}
			var text = tier.getText();
			tierHtml += '<img src="img/tiers/'+(count+1)+((hasCurrentTier)?'':'g')+'.png" alt="'+text+'" title="'+text+'">';
		}
		return tierHtml + "<!--"+currentTier+"-->";
//		document.getElementById("tiers").innerHTML = tierHtml;
	}
	else {
		return "";
//		document.getElementById("tiers").innerHTML = "";
	}
}

function wmhApplyTiers() {
	if(modelList.army.tiers != null) {
		for(var count = currentTier-1; count >= 0; count--) {
			var tier = modelList.army.tiers[count];
			tier.apply(count+1, tier.bonus, tier.bonusParam);
			tier.apply(count+1, tier.bonus2, tier.bonus2Param);
		}
	}
}

function Tier(type, typeParam, bonus, bonusParam, bonus2, bonus2Param) {
	this.type = type;
	this.typeParam = typeParam;
	this.bonus = bonus;
	this.bonusParam = bonusParam;
	this.bonus2 = bonus2;
	this.bonus2Param = bonus2Param;
	this.getText = function() {
		if(this.text == null) {
			this.text = type+" ";
			this.text += typeParam.replace(/ /g, ", ").replace("-", " with ");

			if(bonus != null) {
				this.text += " Bonus: "+bonus+" "+bonusParam.replace(/ /g, ", ");
			}

			if(bonus2 != null) {
				this.text += " Additional bonus: "+bonus2+" "+bonus2Param.replace(/ /g, ", ");
			}

			while(this.text.indexOf("-+1-") != -1) {
				this.text = this.text.replace("-+1-", " +1 for each ");
			}
			while(this.text.indexOf("--1") != -1) {
				this.text = this.text.replace("--1", " by [ONE]");
			}
			while(this.text.indexOf("-") != -1) {
				this.text = this.text.replace("-", " to ");
			}
			if(this.text.lastIndexOf(", ") != -1) {
				this.text = this.text.substring(0,this.text.lastIndexOf(", "))+" and "+this.text.substring(this.text.lastIndexOf(", ")+2);
			}
			for(var c = 0; c < modelList.army.groups.length; c++) {
				var group = modelList.army.groups[c];
				for(var i = 0; i < group.models.length; i++) {
					var model = group.models[i];
					while(this.text.indexOf(model.id) > -1) {
						this.text = this.text.replace(model.id, model.name);
					}
				}
			}
			this.text = this.text.replace(" (3 wracks)", "");
			this.text = this.text.replace("(", "");
			this.text = this.text.replace(")", "");
			this.text = this.text.replace("13", "[THIRTEEN]");
			while(this.text.indexOf(" 1") != -1) {
				this.text = this.text.replace(" 1", " [ONE] or more ");
			}
			while(this.text.indexOf(" 2") != -1) {
				this.text = this.text.replace(" 2", " [TWO] or more ");
			}
			while(this.text.indexOf(" 3") != -1) {
				this.text = this.text.replace(" 3", " [THREE] or more ");
			}
			while(this.text.indexOf(" 4") != -1) {
				this.text = this.text.replace(" 4", " [FOUR] or more ");
			}
			while(this.text.indexOf(" 5") != -1) {
				this.text = this.text.replace(" 5", " [FIVE] or more ");
			}
			this.text = this.text.replace("FA", "FA increased for");
			this.text = this.text.replace("PC", "PC decreased for");
			while(this.text.indexOf("|") != -1) {
				this.text = this.text.replace("|", " or each ");
			}
			while(this.text.indexOf("[ONE]") != -1) {
				this.text = this.text.replace("[ONE]", "1");
			}
			while(this.text.indexOf("[TWO]") != -1) {
				this.text = this.text.replace("[TWO]", "2");
			}
			while(this.text.indexOf("[THREE]") != -1) {
				this.text = this.text.replace("[THREE]", "3");
			}
			while(this.text.indexOf("[FOUR]") != -1) {
				this.text = this.text.replace("[FOUR]", "4");
			}
			while(this.text.indexOf("[FIVE]") != -1) {
				this.text = this.text.replace("[FIVE]", "5");
			}
			this.text = this.text.replace("[THIRTEEN]", "13");
			if(bonus == null) {
				this.text += " Bonus: in game effect";
			}

		}
		return this.text;
	};
	
	this.hasTier = function() {
		switch(type) {
			case 'Only': return this.hasTierOnly();
			case 'Must have': return this.hasTierMustHave();
			case 'Only in battlegroup': return this.hasTierOnlyInBattlegroup();
			case 'Must have in battlegroup': return this.hasTierMustHaveInBattlegroup();
			case 'Must have jackmarshalled': return this.hasTierMustHaveJackmarshalled();
			default: alert("Unknow tier type: "+type); return false;
		}
	};
	
	this.hasTierOnly = function() {
		return this.hasTierModelChecker(null);
	};

	this.hasTierOnlyInBattlegroup = function() {
		if(armyTree.list.length > 0) {
			return this.hasTierModelChecker(armyTree.list[0]);
		}
		else {
			return false;
		}
	};
	
	this.hasTierModelChecker = function(parent) {
		var list = (parent == null)?armyTree.list:parent.listModels;
		for(var c = 0; c < list.length; c++) {
			if(this.typeParam.indexOf(list[c].model.id) == -1) {
				return false;
			}
			if(!this.hasTierModelChecker(list[c])) {
				return false;
			}
		}
		return true;
	};
	
	/* accepted inputs id = model.id, amountId = [amount]id:
	 * amountId{1...}      (one or more models with or without amount) 
	 * amount(id{1...})    (one or more of the models (one count) E.G.at least 3 warjacks)
	 * countId-countId     (one or more models with the following childeren
	 */
	this.hasTierMustHave = function() {
		return this.hasTierCounts(this.typeParam, null);
	};
	
	this.hasTierMustHaveInBattlegroup = function() {
		if(armyTree.list.length > 0) {
			return this.hasTierCounts(this.typeParam, armyTree.list[0]);
		}
		else {
			return false;
		}
	};

	this.hasTierMustHaveJackmarshalled = function() {
		for(var count = 1; count < armyTree.list.length; count++) {
			if(this.hasTierCounts(this.typeParam, armyTree.list[count])) {
				return true;
			}
		}
		return false;
	};


	this.hasTierCounts = function(param, parent) {
//		console.debug('hasTierCounts', param, parent);
		if(param.indexOf("|") != -1) {
//			console.debug('multiple parts');
			var parts = param.split("|");
			for(var c = 0; c < parts.length; c++) {
				var part = parts[c];
				if(!this.hasTierCounts(part)) {
					return false;
				}
			}
			return true;
		}
		else if(param.indexOf("(") != -1) {
//			console.debug('grouped version');
			var count = param.substring(0,1);
			var currentCount = 0;
			var param = param.substring(2, param.length-1);

			var parts = param.split(" ");
			for(var c = 0; c < parts.length; c++) {
				var part = parts[c];
				currentCount +=  this.getModelCount(parent, part);
				if(currentCount >= count) {
					return true;
				}
			}
			return false;
			
		}
		else if(param.indexOf("-") != -1) {
//			console.debug('linked version');
			var parts = param.split("-");
			
			var count = (parts[0].length == 4)?1:parseInt(parts[0].substring(0,1));
			var id = parts[0].substring(parts[0].length-4,parts[0].length);
			return (this.getModelCount(parent, id, parts[1]) >= count);
		}
		else {
//			console.debug('normal version');
			var parts = param.split(" ");
			for(var c = 0; c < parts.length; c++) {
				var part = parts[c];
				var count = (part.length == 4)?1:parseInt(part.substring(0,1));
				var id = part.substring(part.length-4,part.length);
				if(this.getModelCount(parent, id) < count) {
					return false;
				}
			}
			return true;
		}
	};
	
	this.getModelCount = function(parent, id, child) {
		var list = (parent == null)?armyTree.list:parent.listModels;
		var count = 0;
		for(var c = 0; c < list.length; c++) {
			if(id == list[c].model.id) {
				if(child == null || this.getModelCount(list[c], child)) {
					count++;
				}
			}
			count += this.getModelCount(list[c], id);
		}
		return count;
	};
	
	this.preprocess = function(bonusType, bonusValue) {
		if(bonusType == "free") {
			var modelIds = bonusValue.split(" ");
			var listModel = null;
			for(var count = 0; count < modelIds.length && listModel == null; count++) {
				var model = getModelById(modelIds[count]);
				listModel = armyTree.getByModel(model);
			}
			// check if the free model is already added
			if(listModel != null) {
				// if so, substract from points and alter added model
				freeTierPoints += listModel.modelOption.getLabelValue("points");
			}
		}
		if(bonusType == "PC") {
			var split = bonusValue.split(" ");
			for(var sp = 0; sp < split.length; sp++) {
				var parts = split[sp].split("--");
				var modelId = parts[0];
				var pcDecrease = parts[1];
				var model = getModelById(modelId);
				var listModelArray = armyTree.getArrayByModel(model);
				// if so, substract from points and alter added model
				freeTierPoints += listModelArray.length*pcDecrease;
			}
		}
	};

	
	this.apply = function(tier, bonusType, bonusValue) {
		switch(bonusType) {
		case "free": this.applyFree(tier, bonusValue); break;
		case "FA": this.applyFA(tier, bonusValue); break;
		case "PC": this.applyPC(tier, bonusValue); break;
		}
	};
	
	this.applyFree = function(tier, bonusValue) {
		var modelIds = bonusValue.split(" ");
		var listModel = null;
		for(var count = 0; count < modelIds.length && listModel == null; count++) {
			var model = getModelById(modelIds[count]);
			listModel = armyTree.getByModel(model);
		}

		// check if the free model is already added
		if(listModel != null) {
			document.getElementById("lm_"+listModel.id+"_0").innerHTML = "<img src='img/tiers/"+tier+".png'/>";
			if(document.getElementById("lm_"+listModel.id+"_1") != null) {
				document.getElementById("lm_"+listModel.id+"_1").innerHTML = "<img src='img/tiers/"+tier+".png'/>";
			}
		}
		else {
			// if not so, alter left side of the screen
			for(var count = 0; count < modelIds.length && listModel == null; count++) {
				var modelId = modelIds[count];
				var model = getModelById(modelId);
				var html = model.html[1];
				for(var tries = 0; tries < 2; tries++) {
					for(var x = 1; x <= 3; x++) {
						html = html.replace("background-position: 1px 1px;'>"+x+"</span>", "background-position: 1px 1px;'><img src='img/tiers/"+tier+".png'/></span>")
					}
				}
				model.html["TIER"] = html;
				tierModels[tierModels.length] = modelId;
			}
		}
	};
	
	this.applyFA = function(tier, bonusValue) {
		// for all parts
		// get the element at the left side
		// if disabled while it should be enabled: enable it
		// increase the FA
		var params = bonusValue.split(" ");
		for(var c = 0; c < params.length; c++) {
			var parts = params[c].split("-");
			var modelId = parts[0];
			var fa = parts[1];
			var dependantOn = parts[2];
			var model = getModelById(modelId);
			
			var oldFa = model.fa;

			// when dependant alter the fa
			if(dependantOn != null) {
				var d = dependantOn.split("|");
				fa = parseInt(oldFa);
				for(var x = 0; x < d.length; x++) {
					fa += armyTree.getCount(getModelById(d[x]));
				}
			}

			var html = null;
			if(html == null) {
				for(var count = 0; count < model.modelOptions.length; count++) {
					if(armyTree.canAdd(model, model.modelOptions[count], fa) && armyTree.getLabelValue("points")+model.modelOptions[count].getLabelValue("points") <= listSize.get("points")) {
						html = model.html[count+1];
					}
				}
			}
			if(html != null) {
				html = html.replace("<span class='fa'>"+oldFa+"</span>", "<span class='fa tier'>"+fa+"</span>");
				
				model.html["TIER"] = html;
				tierModels[tierModels.length] = modelId;
			}
			else {
				model.html["TIER"] = null;
			}
		}
	};
	
	this.applyPC = function(tier, bonusValue) {
		// for all parts
		// get the element at the left side
		// if disabled while it should be enabled: enable it
		// increase the FA
		var params = bonusValue.split(" ");
		for(var c = 0; c < params.length; c++) {
			var parts = params[c].split("--");
			var modelId = parts[0];
			var pcDecrease = parts[1];
			
			// update left side of the screen
			var model = getModelById(modelId);
			if(model.fa == 'U' || model.fa > armyTree.modelCount(model) || (model.fa == 'C' && armyTree.modelCount(model) == 0)) {
				var html = null;
				for(var x = 0; x < tierModels.length; x++) {
					if(tierModels[x] == model.id) {
						html = model.html["TIER"];
					}
				}
				if(html == null) {
					for(var count = 0; count < model.modelOptions.length; count++) {
						if(armyTree.getLabelValue("points")+model.modelOptions[count].getLabelValue("points")-parseInt(pcDecrease) <= listSize.get("points")) {
							if(model.html != null) {
								html = model.html[count+1];
							}
						}
					}
				}
				if(html != null) {
					for(var x = 2; x <= 12; x++) {
						html = html.replace("background-position: 1px 1px;'>"+x+"</span>", "background-position: 1px 1px; color:#990000; font-weight: bold;'>"+(x-pcDecrease)+"</span>")
					}
					model.html["TIER"] = html;
					tierModels[tierModels.length] = modelId;
				}
			}

			// update listModels
			var listModelArray = armyTree.getArrayByModel(model);
			for(var count = 0; count < listModelArray.length; count++) {
				for(var lm = 0; lm < model.modelOptions.length; lm++) {
					var element = document.getElementById("lm_"+listModelArray[count].id+"_"+lm);
					var html = element.innerHTML;
					html = "<span style='color:#990000; font-weight: bold; float: right;'>"+parseInt(html-pcDecrease)+"</span>";
					element.innerHTML = html;
				}
			}
		}
	};
}

function isFreeBecauseOfTier(model) {
	if(printTierFree != null) {
		if(printTierFree[model.id] == true) {
			return false;
		}
	}
		
    for(var x = 0; x < currentTier; x++) {
        var tier = modelList.army.tiers[x];
        if(tier.bonus == "free") {
            var modelIds = tier.bonusParam.split(" ");
            for(var count = 0; count < modelIds.length; count++) {
                var modelId = modelIds[count];
                if(model.id == modelId) {
                    if(printTierFree != null) {
                        printTierFree[modelId] = true;
                    }
                    return true;
                }
			}
		}
	}
	return false;
}

function isPointReducedBecauseOfTier(model) {
	if(armyTree.list.length > 0) {
		for(var x = 0; x < currentTier; x++) {
			var tier = modelList.army.tiers[x];
			if(tier.bonus == "PC") {
				var modelIds = tier.bonusParam.split(" ");
				for(var count = 0; count < modelIds.length; count++) {
					var modelId = modelIds[count].substring(0,modelIds[count].indexOf("-"));
					if(model.id == modelId) {
					    return true;
					}
				}
			}
			if(tier.bonus2 == "PC") {
				var modelIds = tier.bonus2Param.split(" ");
				for(var count = 0; count < modelIds.length; count++) {
					var modelId = modelIds[count].substring(0,modelIds[count].indexOf("-"));
					if(model.id == modelId) {
					    return true;
					}
				}
			}
		}
	}
	return false;
}


var cygnarColors = new Array("#D9A335","#243D75");
var cygnarFaction = new Faction("Cygnar", "Y", cygnarColors);
factions.push(cygnarFaction);

var cygnarOnlyJacks = new ChildGroup(99, "YJ01 YJ02 YJ03 YJ04 YJ05 YJ06 YJ07 YJ08 YJ09 YJ10 YJ11 YJ12 YJ13 YJ14 YJ15 YJ16 YJ17 YJ18 YJ19 YJ20");
var cygnarJacks = [new ChildGroup(1, "YS06 MS23"), cygnarOnlyJacks];
var cygnarMercJacks = new ChildGroup(99, "MS23 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 YJ17");
var cygnarMarshalledJacks = new ChildGroup(2, "YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ18 YJ19");
var cygnarMarshalledMercJacks = new ChildGroup(2, "MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16"); 

var haley = new ModelOption("p", "Captain Victoria Haley", null, 15, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eHaley = new ModelOption("e", "Major Victoria Haley", null, 15, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("YW01", "Haley", "caster", "C", new Array(haley, eHaley), cygnarJacks));
addModel(new Model("Yw01", "Captain Victoria Haley", "caster", "C", new Array(haley), cygnarJacks));
addModel(new Model("Yx01", "Major Victoria Haley", "caster", "C", new Array(eHaley), cygnarJacks));

var stryker = new ModelOption("p", "Commander Coleman Stryker", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eStryker = new ModelOption("e", "Lord Commander Stryker", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("YW02", "Stryker", "caster", "C", new Array(stryker, eStryker), cygnarJacks));
addModel(new Model("Yw02", "Commander Coleman Stryker", "caster", "C", new Array(stryker), cygnarJacks));
addModel(new Model("Yx02", "Lord Commander Stryker", "caster", "C", new Array(eStryker), cygnarJacks));

var caine = new ModelOption("p", "Lieutenant Allister Caine", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eCaine = new ModelOption("e", "Captain Allister Caine", null, 15, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("YW03", "Caine", "caster", "C", new Array(caine, eCaine), cygnarJacks));
addModel(new Model("Yw03", "Lieutenant Allister Caine", "caster", "C", new Array(caine), cygnarJacks));
addModel(new Model("Yx03", "Captain Allister Caine", "caster", "C", new Array(eCaine), cygnarJacks));

var nemo = new ModelOption("p", "Commander Adept Nemo", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eNemo = new ModelOption("e", "General Adept Nemo", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}]);
var lNemo = new ModelOption("l", "Artificier General Nemo", new Array(1,"Nemo",1,"Finch,"), new Array('Nemo', 14, 'Finch' ,5),[{name:'points',value:-3} , {name:"casters",value:1}]); 
addModel(new Model("YW04", "Nemo", "caster", "C", new Array(nemo, eNemo,lNemo), cygnarJacks));
addModel(new Model("Yw04", "Commander Adept Nemo", "caster", "C", new Array(nemo), cygnarJacks));
addModel(new Model("Yx04", "General Adept Nemo", "caster", "C", new Array(eNemo), cygnarJacks));
addModel(new Model("Yz04", "Artificier General Nemo", "caster" , "C" , new Array(lNemo),cygnarJacks));

addModel(new Model("YW05", "'Siege' Brisbane", "caster", "C", new Array(
		new ModelOption("p", "Major Markus 'Siege' Brisbane", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])
	), cygnarJacks));

addModel(new Model("YW06", "Kraye", "caster", "C", new Array(
		new ModelOption("m", "Captain Jeremiah Kraye", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}])
	), cygnarJacks));

addModel(new Model("YW07", "Darius", "caster", "C", new Array(
		new ModelOption("p", "Captain E. Dominic Darius", null, 22, [{name:'points', value:-5}, {name:"casters", value:1}])
	), cygnarJacks));

addModel(new Model("YW08", "Kara Sloan", "caster", "C", new Array(
		new ModelOption("p", "Captain Kara Sloan", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), cygnarJacks));

addModel(new Model("YW09", "Constance Blaize", "caster", "C", new Array(
		new ModelOption("p", "Constance Blaize, Knights of the Prophet", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), cygnarJacks, null, "MW05 MS22 MU09 MS23"));

// Mercs blaize
addModel(new Model("YX09", "Constance Blaize", "caster", "C", new Array(
		new ModelOption("p", "Constance Blaize, Knights of the Prophet", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), cygnarMercJacks, null, "MW05 MS22 MU09 MS24"));

addModel(new Model("YJ01", "Charger", "lightjack", "U", new Array(new ModelOption("p", "Charger", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("YJ02", "Lancer", "lightjack", "U", new Array(new ModelOption("p", "Lancer", null, "xx..xxx....x.......LAAR.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("YJ03", "Sentinel", "lightjack", "U", new Array(new ModelOption("p", "Sentinel", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("YJ04", "Hunter", "lightjack", "U", new Array(new ModelOption("p", "Hunter", null, "xxxxxxxx..xx.......L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("YJ05", "Grenadier", "lightjack", "U", new Array(new ModelOption("p", "Grenadier", null, "xxxxxxxx..xx.......L..R.LLMCRRxMMCCx", [{name:'points', value:5}])), null, true));
addModel(new Model("YJ06", "Thorn", "lightjack", "C", new Array(new ModelOption("p", "Thorn", null, "xx..xxx....x.......LAAR.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("YJ07", "Defender", "heavyjack", "U", new Array(new ModelOption("p", "Defender", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("Yj07", "Defender", "heavyjack", "1", new Array(new ModelOption("p", "Defender", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("YJ08", "Ironclad", "heavyjack", "U", new Array(new ModelOption("p", "Ironclad", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("YJ09", "Centurion", "heavyjack", "U", new Array(new ModelOption("p", "Centurion", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("YJ10", "Stormclad", "heavyjack", "U", new Array(new ModelOption("p", "Stormclad", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("YJ11", "Thunderhead", "heavyjack", "C", new Array(new ModelOption("p", "Thunderhead", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:12}])), null, true));
addModel(new Model("YJ12", "Hammersmith", "heavyjack", "U", new Array(new ModelOption("p", "Hammersmith", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("YJ13", "Ol' Rowdy", "heavyjack", "C", new Array(new ModelOption("p", "Ol' Rowdy", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("YJ14", "Cyclone", "heavyjack", "U", new Array(new ModelOption("p", "Cyclone", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("YJ15", "Firefly", "lightjack", "U", new Array(new ModelOption("p", "Firefly", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:5}])), null, true));
addModel(new Model("YJ16", "Triumph", "heavyjack", "C", new Array(new ModelOption("p", "Triumph", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:11}])), null, true));
addModel(new Model("YJ17", "Gallant", "heavyjack", "C", new Array(new ModelOption("p", "Gallant", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true, "MW05 MS22"));
addModel(new Model("YJ18", "Minuteman", "lightjack", "U", new Array(new ModelOption("p", "Minuteman", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:5}])), null, true));
addModel(new Model("YJ19", "Avenger", "heavyjack", "U", new Array(new ModelOption("p", "Avenger", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
//add Grid Stormwall
addModel(new Model("YJ20", "Stormwall", "heavyjack", "2" , new Array(new ModelOption("p", "Stormwall", null, new Array('Left',"xxxxx.xxx.......SS.LLLSCLLCCCCLCMMMM",'Right',".xxxxx...xxxSS....CSRRR.CCCCRRMMMMCR"),[{name:'points', value:19}])), null, true));

addModel(new Model("YE01", "Storm Strider", "battleengine", "2", new Array(new ModelOption("p", "Storm Strider", null, 22, [{name:'points', value:9}]))));

addModel(new Model("YS01", "Journeyman Warcaster", "solo", "1", new Array(new ModelOption("p", "Journeyman Warcaster", null, 5, [{name:'points', value:3}])), cygnarOnlyJacks));
addModel(new Model("YS02", "Gun Mage Captain Adept", "solo", "2", new Array(new ModelOption("p", "Gun Mage Captain Adept", null, 5, [{name:'points', value:2}]))));
addModel(new Model("YS03", "Stormsmith Stormcaller", "solo", "3", new Array(new ModelOption("p", "Stormsmith Stormcaller", null, null, [{name:'points', value:1}]))));
addModel(new Model("YS04", "Captain Maxwell Finn", "solo", "C", new Array(new ModelOption("p", "Captain Maxwell Finn", null, 5, [{name:'points', value:3}]))));
addModel(new Model("YS05", "Major Katherine Laddermore", "solo", "C", new Array(new ModelOption("m", "Major Katherine Laddermore", new Array(1, "Major Katherine Laddermore (mounted)", 1, "Major Katherine Laddermore (dismounted)"), new Array("Mounted", 10, "Dismounted", 5), [{name:'points', value:5}]))));
addModel(new Model("YS06", "Squire", "solo", "1", new Array(new ModelOption("p", "Squire", null, new Array("Squire", 5, "Accumulator circle", "ooo"), [{name:'points', value:2}])), null, true));
addModel(new Model("YS07", "Captain Arlan Strangewayes", "solo", "C", new Array(new ModelOption("p", "Captain Arlan Strangewayes", null, 5, [{name:'points', value:2}])), cygnarMarshalledJacks));
addModel(new Model("YS08", "Trencher Master Gunner", "solo", "2", new Array(new ModelOption("p", "Trencher Master Gunner", null, 5, [{name:'points', value:2}]))));
addModel(new Model("YS09", "Archduke Alain Runewood", "solo", "C", new Array(new ModelOption("p", "Archduke Alain Runewood", null, 5, [{name:'points', value:3}])), cygnarMarshalledJacks));

addModel(new Model("YU01", "Arcane Tempest Gun Mages", "unit", "2", new Array(new ModelOption("6", "Arcane Tempest Gun Mages (Leader and 5 Grunts)", new Array(1, "Arcane Tempest Gun Mage Leader", 5, "Arcane Tempest Gun Mage Grunt"), null, [{name:'points', value:6}])), new Array(new ChildGroup(1, "YA01"), new ChildGroup(1, "Ya01"))));
addModel(new Model("YA01", "Arcane Tempest Gun Mage Officer", "ua", "1", new Array(new ModelOption("p", "Arcane Tempest Gun Mage Officer", null, 5, [{name:'points', value:2}])), cygnarMarshalledJacks, true));
addModel(new Model("Ya01", "Arcane Tempest Gun Mage Officer", "ua", "1", new Array(new ModelOption("p", "Arcane Tempest Gun Mage Officer", null, 5, [{name:'points', value:2}])), cygnarMarshalledMercJacks, true));
addModel(new Model("YU02", "Long Gunner Infantry", "unit", "2", new Array(
		new ModelOption("6", "Long Gunner Infantry (Leader and 5 Grunts)", new Array(1, "Long Gunner Leader", 5, "Long Gunner Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Long Gunner Infantry (Leader and 9 Grunts)", new Array(1, "Long Gunner Leader", 9, "Long Gunner Grunt"), null, [{name:'points', value:10}])
	), new ChildGroup(1, "YA07")));
addModel(new Model("YU03", "Field Mechaniks", "unit", "3", new Array(
		new ModelOption("3", "Field Mechaniks (Leader and 3 Grunts)", new Array(1, "Field Mechanik Leader", 2, "Field Mechanik Grunt"), null, [{name:'points', value:2}]),
		new ModelOption("6", "Field Mechaniks (Leader and 5 Grunts)", new Array(1, "Field Mechanik Leader", 5, "Field Mechanik Grunt"), null, [{name:'points', value:3}])
	), cygnarMarshalledJacks));
addModel(new Model("YU04", "Stormblade Infantry", "unit", "2", new Array(
		new ModelOption("6", "Stormblade Infantry (Leader and 5 Grunts)", new Array(1, "Stormblade Infantry Leader", 5, "Stormblade Infantry Grunt"), null, [{name:'points', value:5}])
	), new Array(new ChildGroup(1, "YA02"),new ChildGroup(1, "YA09"))));
addModel(new Model("YA02", "Stormblade Infantry Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Stormblade Infantry Officer & Standard", new Array(1, "Stormblade Infantry Officer", 1, "Stormblade Infantry Standard"), new Array("Officer", 5), [{name:'points', value:3}])), cygnarMarshalledJacks, true));
addModel(new Model("YU05", "Trencher Infantry", "unit", "2", new Array(
		new ModelOption("6", "Trencher Infantry (Leader and 5 Grunts)", new Array(1, "Trencher Infantry Leader", 5, "Trencher Infantry Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Trencher Infantry (Leader and 9 Grunts)", new Array(1, "Trencher Infantry Leader", 9, "Trencher Infantry Grunt"), null, [{name:'points', value:10}])
	), new Array(new ChildGroup(1, "YA03"), new ChildGroup(1, "Ya03"), new ChildGroup(1, "YA04"))));
addModel(new Model("YA03", "Trencher Infantry Officer & Sniper", "ua", "1", new Array(new ModelOption("2", "Trencher Infantry Officer & Sniper", new Array(1, "Trencher Infantry Officer", 1, "Trencher Infantry Sniper"), new Array("Officer", 5), [{name:'points', value:3}])), cygnarMarshalledJacks, true));
addModel(new Model("Ya03", "Trencher Infantry Officer & Sniper", "ua", "1", new Array(new ModelOption("2", "Trencher Infantry Officer & Sniper", new Array(1, "Trencher Infantry Officer", 1, "Trencher Infantry Sniper"), new Array("Officer", 5), [{name:'points', value:3}])), cygnarMarshalledMercJacks, true));
addModel(new Model("YA04", "Trencher Infantry Grenadier", "ua", "2", new Array(
		new ModelOption("1", "1 Trencher Infantry Grenadier", new Array(1, "Trencher Infantry Grenadier"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Trencher Infantry Grenadier", new Array(2, "Trencher Infantry Grenadier"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Trencher Infantry Grenadier", new Array(3, "Trencher Infantry Grenadier"), null, [{name:'points', value:3}])
	), null, true));
addModel(new Model("YU06", "Trencher Chaingun Crew", "unit", "2", new Array(new ModelOption("2", "Trencher Chaingun Crew", new Array(1, "Trencher Chaingun Leader", 1, "Trencher Chaingun Grunt"), null, [{name:'points', value:2}]))));
addModel(new Model("YU07", "Trencher Cannon Crew", "unit", "2", new Array(new ModelOption("2", "Trencher Cannon", new Array(1, "Trencher Cannon Leader", 1, "Trencher Cannon Grunt"), null, [{name:'points', value:3}]))));
addModel(new Model("YU08", "Sword Knights", "unit", "2", new Array(
		new ModelOption("6", "Sword Knights (Leader and 5 Grunts)", new Array(1, "Sword Knight Leader", 5, "Sword Knight Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Sword Knights (Leader and 9 Grunts)", new Array(1, "Sword Knight Leader", 9, "Sword Knight Grunt"), null, [{name:'points', value:6}])
	), new Array(new ChildGroup(1, "YA05"), cygnarMarshalledJacks)));
addModel(new Model("Yu08", "Sword Knights", "unit", "2", new Array(
		new ModelOption("6", "Sword Knights (Leader and 5 Grunts)", new Array(1, "Sword Knight Leader", 5, "Sword Knight Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Sword Knights (Leader and 9 Grunts)", new Array(1, "Sword Knight Leader", 9, "Sword Knight Grunt"), null, [{name:'points', value:6}])
	), new Array(new ChildGroup(1, "YA05"), new ChildGroup(2, "MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 YJ17 Yj07"))));
addModel(new Model("YA05", "Sword Knight Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Sword Knight Officer & Standard", new Array(1, "Sword Knight Officer", 1, "Sword Knight Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("YU09", "Stormguard", "unit", "2", new Array(
		new ModelOption("6", "Stormguard (Leader and 5 Grunts)", new Array(1, "Stormguard Leader", 5, "Stormguard Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Stormguard (Leader and 9 Grunts)", new Array(1, "Stormguard Leader", 9, "Stormguard Grunt"), null, [{name:'points', value:9}])
	))); 
addModel(new Model("YU10", "Storm Lances", "unit", "1", new Array(
		new ModelOption("3", "Storm Lances (Leader and 2 Grunts)", new Array(1, "Storm Lances Leader", 2, "Storm Lances Grunt"), new Array("Lancer A", 5, "Lancer B", 5, "Lancer C", 5), [{name:'points', value:7}]),
		new ModelOption("5", "Storm Lances (Leader and 4 Grunts)", new Array(1, "Storm Lances Leader", 4, "Storm Lances Grunt"), new Array("Lancer A", 5, "Lancer B", 5, "Lancer C", 5, "Lancer D", 5, "Lancer E", 5), [{name:'points', value:11}])
	)));
addModel(new Model("YU11", "Black 13th Gun Mage Strike Team", "unit", "C", new Array(new ModelOption("3", "Black 13th Gun Mage Strike Team", new Array(1, "Black 13th Lynch", 1, "Black 13th Ryan", 1, "Black 13th Watts"), new Array("Lynch", 5, "Ryan", 5, "Watts", 5), [{name:'points', value:4}]))));
addModel(new Model("YU12", "Precursor Knights", "unit", "2", new Array(
		new ModelOption("6", "Precursor Knights (Leader and 5 Grunts)", new Array(1, "Precursor Knight Leader", 5, "Precursor Knight Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Precursor Knights (Leader and 9 Grunts)", new Array(1, "Precursor Knight Leader", 9, "Precursor Knight Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "YA06"), null, "MW05 MS22"));
addModel(new Model("YA06", "Precursor Knight Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Precursor Knight Officer & Standard", new Array(1, "Precursor Knight Officer", 1, "Precursor Knight Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("YU13", "Rangers", "unit", "2", new Array(new ModelOption("6", "Rangers", new Array(1, "Ranger Leader", 5, "Ranger Grunt"), null, [{name:'points', value:5}]))));

addModel(new Model("YA07", "Long Gunner Infantry Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Long Gunner Infantry Officer & Standard", new Array(1, "Long Gunner Infantry Officer", 1, "Long Gunner Infantry Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
 
addModel(new Model("YU14", "Trencher Commandos", "unit", "2", new Array(
		new ModelOption("6", "Trencher Commandos (Leader and 5 Grunts)", new Array(1, "Trencher Commandos Leader", 5, "Trencher Commandos Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Trencher Commandos (Leader and 9 Grunts)", new Array(1, "Trencher Commandos Leader", 9, "Trencher Commandos Grunt"), null, [{name:'points', value:10}])
), new ChildGroup(1, "YA08")));

addModel(new Model("YU15", "Storm Tower", "ua", "2", new Array(new ModelOption("2", "Storm Tower", new Array(1, "Storm Tower Leader", 1, "Storm Tower Grunt"), null, [{name:'points', value:2}]))));

addModel(new Model("YA08", "Trencher Commandos Scattergunner", "ua", "2", new Array(
		new ModelOption("1", "1 Trencher Commandos Scattergunner", new Array(1, "Trencher Commandos Scattergunner"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Trencher Commandos Scattergunner", new Array(2, "Trencher Commandos Scattergunner"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Trencher Commandos Scattergunner", new Array(3, "Trencher Commandos Scattergunner"), null, [{name:'points', value:3}])
	), null, true));

addModel(new Model("YA09", "Stormblade Infantry Storm Gunner", "ua", "2", new Array(
		new ModelOption("1", "1 Stormblade Infantry Storm Gunner", new Array(1, "Stormblade Infantry Storm Gunner"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Stormblade Infantry Storm Gunner", new Array(2, "Stormblade Infantry Storm Gunner"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Stormblade Infantry Storm Gunner", new Array(3, "Stormblade Infantry Storm Gunner"), null, [{name:'points', value:3}])
	), null, true));

addModel(new Model("YA10", "Captain Jonas Murdoch", "ua", "C", new Array(new ModelOption("p", "Captain Jonas Murdoch", null, 5, [{name:'points', value:2}])), null, true));
var cryxColors = new Array("#C0CAA4","black");
var cryxFaction = new Faction("Cryx", "C", cryxColors);
factions.push(cryxFaction);

var cryxJacksWithoutAttachment = new ChildGroup(99, "CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ06 CJ07 CJ08 CJ09 CJ10 CJ11 CJ12 CJ13 CJ14 CJ15 CJ16 CJ17 CJ18 CJ19 CJ20")
var cryxJacks = new ChildGroup(99, "CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ06 CJ07 CJ08 CJ09 CJ10 CJ11 CJ12 CJ13 CJ14 CJ15 CJ16 CJ17 CJ18 CJ19 CJ20 MJ12 MJ13 CS01");
var cryxMarshalledJacks = new ChildGroup(2, "CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ15 CJ17 CJ18");

var gaspy = new ModelOption("p", "Iron Lich Asphyxious", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eGaspy = new ModelOption("e", "Lich Lord Asphyxious", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var lGaspy = new ModelOption("l", "Asphyxious the Hellbringer", new Array(1,"Asphyxious",1,"Vociferon"), new Array('Asphyxious',18,'Vociferon',5), [{name:'points', value:-4}, {name:"casters", value:1}]);
addModel(new Model("CW01", "Asphyxious", "caster", "C", new Array(gaspy, eGaspy,lGaspy), cryxJacks));
addModel(new Model("Cw01", "Iron Lich Asphyxious", "caster", "C", new Array(gaspy), cryxJacks));
addModel(new Model("Cx01", "Lich Lord Asphyxious", "caster", "C", new Array(eGaspy), cryxJacks));
addModel(new Model("Cz01", "Asphyxious the Hellbringer", "caster", "C", new Array(lGaspy), cryxJacks));

var denny = new ModelOption("p", "Warwitch Deneghra", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eDenny = new ModelOption("e", "Wraith Witch Deneghra", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("CW02", "Deneghra", "caster", "C", new Array(denny, eDenny), cryxJacks));
addModel(new Model("Cw02", "Warwitch Deneghra", "caster", "C", new Array(denny), cryxJacks));
addModel(new Model("Cx02", "Wraith Witch Deneghra", "caster", "C", new Array(eDenny), cryxJacks));

var skarre = new ModelOption("p", "Pirate Queen Skarre", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eSkarre = new ModelOption("e", "Skarre, Queen of the Broken Coast", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("CW03", "Skarre", "caster", "C", new Array(skarre, eSkarre), cryxJacks));
addModel(new Model("Cw03", "Pirate Queen Skarre", "caster", "C", new Array(skarre), cryxJacks));
addModel(new Model("Cx03", "Skarre, Queen of the Broken Coast", "caster", "C", new Array(eSkarre), cryxJacks));

addModel(new Model("CW04", "Terminus", "caster", "C", new Array(
		new ModelOption("p", "Lich Lord Terminus", null, 20, [{name:'points', value:-4}, {name:"casters", value:1}])
	), cryxJacks));

var goreshade = new ModelOption("p", "Goreshade the Bastard", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eGoreshade = new ModelOption("e", "Goreshade the Cursed", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}])
addModel(new Model("CW05", "Goreshade", "caster", "C", new Array(goreshade, eGoreshade), cryxJacks));
addModel(new Model("Cw05", "Goreshade the Bastard", "caster", "C", new Array(goreshade), cryxJacks));
addModel(new Model("Cx05", "Goreshade the Cursed", "caster", "C", new Array(eGoreshade), cryxJacks));

addModel(new Model("CW06", "Witch Coven", "caster", "C", new Array(
		new ModelOption("p", "The Witch Coven of Garlghast", new Array(3, "Witch Coven Witch"), new Array('Helleana',8,'Morgaen',8,'Selena',8), [{name:'points', value:-5}, {name:"casters", value:1}])
	), cryxJacks));
addModel(new Model("CW07", "Mortenebra", "caster", "C", new Array(
		new ModelOption("p", "Master Necrotech Mortenebra", new Array(1, "Mortenebra", 1, "Deryliss"), new Array('Mortenebra', 16, 'Deryliss', 5), [{name:'points', value:-4}, {name:"casters", value:1}])
	), cryxJacksWithoutAttachment));
addModel(new Model("CW08", "Venethrax", "caster", "C", new Array(
		new ModelOption("p", "Lich Lord Venethrax", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}])
	), cryxJacks));
addModel(new Model("CW09", "Scaverous", "caster", "C", new Array(
		new ModelOption("p", "Lord Exhumator Scaverous", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])
	), cryxJacks));

addModel(new Model("CJ01", "Deathripper", "lightjack", "U", new Array(new ModelOption("p", "Deathripper", null, "xxxxxxxxxxxxxx..xx......HHCAAMHCCMMM", [{name:'points', value:4}])), null, true));
addModel(new Model("CJ02", "Defiler", "lightjack", "U", new Array(new ModelOption("p", "Defiler", null, "xxxxxxxxxxxxxx..xx......HHCAAMHCCMMM", [{name:'points', value:5}])), null, true));
addModel(new Model("CJ03", "Nightwretch", "lightjack", "U", new Array(new ModelOption("p", "Nightwretch", null, "xxxxxxxxxxxxxx..xx......HHCAAMHCCMMM", [{name:'points', value:4}])), null, true));
addModel(new Model("CJ04", "Stalker", "lightjack", "U", new Array(new ModelOption("p", "Stalker", null, "xxxxxxxxxxxxx.xx.x.L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("CJ05", "Helldiver", "lightjack", "U", new Array(new ModelOption("p", "Helldiver", null, "xxxxxxxxxxxxx....x......HCCCCMHHHMMM", [{name:'points', value:3}])), null, true));
addModel(new Model("CJ06", "Cankerworm", "lightjack", "C", new Array(new ModelOption("p", "Cankerworm", null, "xxxxxxxxxxxx............HCCCCMHHHMMM", [{name:'points', value:5}])), null, true));
addModel(new Model("CJ07", "Slayer", "heavyjack", "U", new Array(new ModelOption("p", "Slayer", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("CJ08", "Reaper", "heavyjack", "U", new Array(new ModelOption("p", "Reaper", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("CJ09", "Seether", "heavyjack", "U", new Array(new ModelOption("p", "Seether", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("CJ10", "Leviathan", "heavyjack", "U", new Array(new ModelOption("p", "Leviathan", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("CJ11", "Harrower", "heavyjack", "U", new Array(new ModelOption("p", "Harrower", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("CJ12", "Deathjack", "heavyjack", "C", new Array(new ModelOption("p", "Deathjack", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:12}])), null, true));
addModel(new Model("CJ13", "Nightmare", "heavyjack", "C", new Array(new ModelOption("p", "Nightmare", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("CJ14", "Corruptor", "heavyjack", "U", new Array(new ModelOption("p", "Corruptor", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("CJ15", "Ripjaw", "lightjack", "U", new Array(new ModelOption("p", "Ripjaw", null, "xxxxxxxxxxxxxx..xx......HHCAAMHCCMMM", [{name:'points', value:5}])), null, true));
addModel(new Model("CJ16", "Malice", "heavyjack", "C", new Array(new ModelOption("p", "Malice", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("CJ17", "Scavenger", "lightjack", "U", new Array(new ModelOption("p", "Scavenger", null, "xxxxxxxxxxxxx.xx.x......HCCCCMxHHMMx", [{name:'points', value:4}])), null, true));
addModel(new Model("CJ18", "Desecrator", "heavyjack", "U", new Array(new ModelOption("p", "Desecrator", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("CJ19", "Erebus", "heavyjack", "C", new Array(new ModelOption("p", "Erebus", null, "xx..xxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("CJ20", "Kraken", "heavyjack", "2", new Array(new ModelOption("p", "Kraken", null, new Array('Left',"xxxxx.xxx.......SS..LLSCLLCCCCLCMMMM",'Right',"..xxxx...xxxSS....CSLL..CCCCLLMMMMCL"), [{name:'points', value:19}])), null, true));

addModel(new Model("CE01", "Wraith Engine", "battleengine", "2", new Array(new ModelOption("p", "Wraith Engine", null, 20, [{name:'points', value:9}]))));

addModel(new Model("CS01", "Skarlock Thrall", "solo", "1", new Array(new ModelOption("p", "Skarlock Thrall", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("CS02", "Bloat Thrall", "solo", "2", new Array(new ModelOption("p", "Bloat Thrall", null, 8, [{name:'points', value:2}]))));
addModel(new Model("CS03", "Necrotech", "solo", "3", new Array(new ModelOption("2", "Necrotech & 1 Scrap Thrall", new Array(1, "Necrotech", 1, "Scrap Thrall"), new Array("Necrotech", 5), [{name:'points', value:1}]))));
addModel(new Model("CS04", "Scrap Thrall", "solo", "3", new Array(new ModelOption("3", "3 Scrap Thrall", new Array(3, "Scrap Thrall"), null, [{name:'points', value:1}]))));
addModel(new Model("CS05", "Machine Wraith", "solo", "3", new Array(new ModelOption("p", "Machine Wraith", null, null, [{name:'points', value:1}]))));
addModel(new Model("CS06", "Pistol Wraith", "solo", "2", new Array(new ModelOption("p", "Pistol Wraith", null, 5, [{name:'points', value:3}]))));
addModel(new Model("CS07", "Bane Lord Tartarus", "solo", "C", new Array(new ModelOption("p", "Bane Lord Tartarus", null, 8, [{name:'points', value:4}]))));
addModel(new Model("CS08", "Captain Rengrave", "solo", "C", new Array(new ModelOption("p", "Captain Rengrave", null, 5, [{name:'points', value:2}]))));
addModel(new Model("CS09", "Darragh Wrathe", "solo", "C", new Array(new ModelOption("m", "Darragh Wrathe", new Array(1, "Darragh Wrathe (mounted)", 1, "Darragh Wrathe (dismounted)"), new Array("Mounted",10,"Dismounted",5), [{name:'points', value:4}]))));
addModel(new Model("CS10", "General Gerlak Slaughterborn", "solo", "C", new Array(new ModelOption("p", "General Gerlak Slaughterborn", null, 8, [{name:'points', value:3}])), null, null, "MU05"));
addModel(new Model("CS11", "Warwitch Siren", "solo", "2", new Array(new ModelOption("p", "Warwitch Siren", null, 5, [{name:'points', value:2}]))));
addModel(new Model("CS12", "Satyxis Raider Captain", "solo", "2", new Array(new ModelOption("p", "Satyxis Raider Captain", null, 5, [{name:'points', value:2}]))));
addModel(new Model("CS13", "Iron Lich Overseer", "solo", "2", new Array(new ModelOption("p", "Iron Lich Overseer", null, 8, [{name:'points', value:3}])), cryxMarshalledJacks));


addModel(new Model("CU01", "Bane Thralls", "unit", "3", new Array(
		new ModelOption("6", "Bane Thralls (Leader and 5 Grunts)", new Array(1, "Bane Thrall Leader", 5, "Bane Thrall Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Bane Thralls (Leader and 9 Grunts)", new Array(1, "Bane Thrall Leader", 9, "Bane Thrall Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "CA04")));
	
addModel(new Model("CU02", "Bile Thralls", "unit", "3", new Array(
		new ModelOption("6", "Bile Thralls (Leader and 5 Grunts)", new Array(1, "Bile Thrall Leader", 5, "Bile Thrall Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Bile Thralls (Leader and 9 Grunts)", new Array(1, "Bile Thrall Leader", 9, "Bile Thrall Grunt"), null, [{name:'points', value:8}])
	)));

addModel(new Model("CU03", "Mechanithralls", "unit", "3", new Array(
		new ModelOption("6", "Mechanithralls (Leader and 5 Grunts)", new Array(1, "Mechanithrall Leader", 5, "Mechanithrall Grunt"), null, [{name:'points', value:3}]),
		new ModelOption("10", "Mechanithralls (Leader and 9 Grunts)", new Array(1, "Mechanithrall Leader", 5, "Mechanithrall Grunt"), null, [{name:'points', value:5}])
	), new Array(new ChildGroup(1, "CA02"))));
addModel(new Model("CA02", "Brute Thrall", "ua", "3", new Array(
		new ModelOption("1", "1 Brute Thrall", new Array(1, "Brute Thrall"), 8, [{name:'points', value:1}]),
		new ModelOption("2", "2 Brute Thrall", new Array(2, "Brute Thrall"), new Array("Brute A", 8, "Brute B", 8), [{name:'points', value:2}]),
		new ModelOption("3", "3 Brute Thrall", new Array(3, "Brute Thrall"), new Array("Brute A", 8, "Brute B", 8, "Brute C", 8), [{name:'points', value:3}])
	), null, true));

addModel(new Model("CU04", "Satyxis Raiders", "unit", "2", new Array(
		new ModelOption("6", "Satyxis Raiders (Leader and 5 Grunts)", new Array(1, "Satyxis Raider Leader", 5, "Satyxis Raider Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Satyxis Raiders (Leader and 9 Grunts)", new Array(1, "Satyxis Raider Leader", 9, "Satyxis Raider Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "CA03")));
addModel(new Model("CA03", "Satyxis Raider Sea Witch", "ua", "1", new Array(new ModelOption("p", "Satyxis Raider Sea Witch", null, 5, [{name:'points', value:2}])), null, true));

addModel(new Model("CU05", "Revenant Crew of the Atramentous", "unit", "2", new Array(
		new ModelOption("6", "Revenant Crew (Leader and 5 Grunts)", new Array(1, "Revenant Crew Leader", 5, "Revenant Crew Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Revenant Crew (Leader and 9 Grunts)", new Array(1, "Revenant Crew Leader", 9, "Revenant Crew Grunt"), null, [{name:'points', value:9}])
	), new ChildGroup(1, "CA06")));
addModel(new Model("CA06", "Revenant Crew Crew Riflemen", "ua", "2", new Array(
		new ModelOption("1", "1 Revenant Crew Crew Rifleman", new Array(1, "Revenant Crew Crew Rifleman"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Revenant Crew Crew Riflemen", new Array(2, "Revenant Crew Crew Rifleman"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Revenant Crew Crew Riflemen", new Array(3, "Revenant Crew Crew Rifleman"), null, [{name:'points', value:3}])
	), null, true));	

addModel(new Model("CU06", "Bane Knights", "unit", "3", new Array(
		new ModelOption("6", "Bane Knights (Leader and 5 Grunts)", new Array(1, "Bane Knight Leader", 5, "Bane Knight Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Bane Knights (Leader and 9 Grunts)", new Array(1, "Bane Knight Leader", 9, "Bane Knight Grunt"), null, [{name:'points', value:10}])
	)));

addModel(new Model("CU07", "Black Ogrun Boarding Party", "unit", "2", new Array(
		new ModelOption("3", "Black Ogrun Boarding Party (Leader and 2 Grunts)", new Array(1, "Black Ogrun Boarding Party Leader", 2, "Black Ogrun Boarding Party Grunt"), new Array("Ogrun A",8,"Ogrun B",8,"Ogrun C",8), [{name:'points', value:4}]),
		new ModelOption("5", "Black Ogrun Boarding Party (Leader and 4 Grunts)", new Array(1, "Black Ogrun Boarding Party Leader", 4, "Black Ogrun Boarding Party Grunt"), new Array("Ogrun A",8,"Ogrun B",8,"Ogrun C",8,"Ogrun D",8,"Ogrun E",8), [{name:'points', value:6}])
	)));

addModel(new Model("CU08", "Soulhunters", "unit", "1", new Array(
		new ModelOption("3", "Soulhunters (Leader and 2 Grunts)", new Array(1, "Soulhunter Leader", 2, "Soulhunter Grunt"), new Array("Soulhunter A",5,"Soulhunter B",5,"Soulhunter C",5), [{name:'points', value:6}]),
		new ModelOption("5", "Soulhunters (Leader and 4 Grunts)", new Array(1, "Soulhunter Leader", 4, "Soulhunter Grunt"), new Array("Soulhunter A",5,"Soulhunter B",5,"Soulhunter C",5,"Soulhunter D",5,"Soulhunter E",5), [{name:'points', value:9}])
	)));

addModel(new Model("CU09", "Blackbane's Ghost Raiders", "unit", "C", new Array(
		new ModelOption("6", "Blackbane's Ghost Raiders (Leader and 5 Grunts)", new Array(1, "Blackbane", 5, "Blackbane's Ghost Raider Grunt"), new Array("Blackbane", 5), [{name:'points', value:6}]),
		new ModelOption("10", "Blackbane's Ghost Raiders (Leader and 9 Grunts)", new Array(1, "Blackbane", 9, "Blackbane's Ghost Raider Grunt"), new Array("Blackbane", 5), [{name:'points', value:9}])
	)));

addModel(new Model("CU10", "Bloodgorgers", "unit", "2", new Array(
		new ModelOption("6", "Bloodgorgers (Leader and 5 Grunts)", new Array(1, "Bloodgorger Leader", 5, "Bloodgorger Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Bloodgorgers (Leader and 9 Grunts)", new Array(1, "Bloodgorger Leader", 9, "Bloodgorger Grunt"), null, [{name:'points', value:8}])
	), null, null, "MU05"));
	 
addModel(new Model("CU11", "Revenant Cannon Crew", "unit", "2", new Array(new ModelOption("3", "Revenant Cannon Crew", new Array(1, "Revenant Cannon Crew Leader", 2, "Revenant Cannon Crew Grunt"), null, [{name:'points', value:3}]))));

addModel(new Model("CU12", "The Withershadow Combine", "unit", "C", new Array(new ModelOption("3", "The Withershadow Combine", new Array(1, "Withershadow Maelovus", 1, "Withershadow Admonia", 1, "Withershadow Tremulus"), new Array("Maelovus", 5, "Admonia", 5, "Tremulus", 5), [{name:'points', value:5}]))));

addModel(new Model("CU13", "Cephalyx Mind Slaver & Drudges", "unit", "2", new Array(
		new ModelOption("6", "Cephalyx Mind Slaver & 5 Drudges", new Array(1, "Cephalyx Mind Slaver", 5, "Drudges"), new Array("Mind Slaver", 5), [{name:'points', value:4}]),
		new ModelOption("10", "Cephalyx Mind Slaver & 9 Drudges", new Array(1, "Cephalyx Mind Slaver", 9, "Drudges"), new Array("Mind Slaver", 5), [{name:'points', value:6}])
	)));

addModel(new Model("CU14", "Cephalyx Overlords", "unit", "1", new Array(new ModelOption("3", "Cephalyx Overlords", new Array(3, "Cephalyx Overlord"), new Array("Overlord A", 5, "Overlord B", 5, "Overlord C", 5), [{name:'points', value:4}]))));	

addModel(new Model("CU15", "Necrosurgeon & Stitch Thralls", "unit", "2", new Array(new ModelOption("4", "Necrosurgeon & 3 Stitch Thralls", new Array(1, "Necrosurgeon", 3, "Stich Thralls"), 5, [{name:'points', value:2}]))));

addModel(new Model("CA04", "Bane Thrall Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Bane Thrall Officer & Standard", new Array(1, "Bane Thrall Officer", 1, "Bane Thrall Standard"), new Array("Officer", 5), [{name:'points', value:3}])), null, true));

addModel(new Model("CU16", "Satyxis Blood Witches", "unit", "2", new Array(
		new ModelOption("6", "Satyxis Blood Witches (Leader and 5 Grunts)", new Array(1, "Satyxis Blood Witches Leader", 5, "Satyxis Blood Witches Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Satyxis Blood Witches (Leader and 9 Grunts)", new Array(1, "Satyxis Blood Witches Leader", 9, "Satyxis Blood Witches Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "CA05")));
addModel(new Model("CA05", "Satyxis Blood Hag", "ua", "1", new Array(new ModelOption("p", "Satyxis Blood Hag", null, 5, [{name:'points', value:2}])), null, true));
var menothColors = new Array("#DBCFB2", "#69362D");
var menothFaction = new Faction("Protectorate of Menoth", "P", menothColors);
factions.push(menothFaction);

var menothJacks = new ChildGroup(99, "PJ01 PJ02 PJ03 PJ04 PJ05 PJ06 PJ07 PJ08 PJ09 PJ10 PJ11 PJ12 PJ13 PJ14 PJ15 PJ16 PJ17 PJ18 PJ19 PS08");
	
var kreoss = new ModelOption("p", "High Exemplar Kreoss", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eKreoss = new ModelOption("e", "Grand Exemplar Kreoss", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var lKreoss = new ModelOption("l", "Intercessor Kreoss", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("PW01", "Kreoss", "caster", "C", new Array(kreoss, eKreoss,lKreoss), menothJacks));
addModel(new Model("Pw01", "High Exemplar Kreoss", "caster", "C", new Array(kreoss), menothJacks));
addModel(new Model("Px01", "Grand Exemplar Kreoss", "caster", "C", new Array(eKreoss), menothJacks));
addModel(new Model("Pz01", "Intercessor Kreoss", "caster", "C", new Array(lKreoss), menothJacks));

var reclaimer = new ModelOption("p", "The High Reclaimer", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var testament = new ModelOption("e", "Testament of Menoth", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("PW02", "Reclaimer/Testament", "caster", "C", new Array(reclaimer, testament), menothJacks));
addModel(new Model("Pw02", "Reclaimer", "caster", "C", new Array(reclaimer), menothJacks));
addModel(new Model("Px02", "Testament", "caster", "C", new Array(testament), menothJacks));

var severius = new ModelOption("p", "Grand Scrutator Severius", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eSeverius = new ModelOption("e", "Hierarch Severius", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("PW03", "Severius", "caster", "C", new Array(severius, eSeverius), menothJacks));
addModel(new Model("Pw03", "Grand Scrutator Severius", "caster", "C", new Array(severius), menothJacks));
addModel(new Model("Px03", "Hierarch Severius", "caster", "C", new Array(eSeverius), menothJacks));

var feora = new ModelOption("p", "Feora, Priestess of the Flame", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eFeora = new ModelOption("e", "Feora, Protector of the Flame", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("PW04", "Feora", "caster", "C", new Array(feora, eFeora), menothJacks));
addModel(new Model("Pw04", "Feora, Priestess of the Flame", "caster", "C", new Array(feora), menothJacks));
addModel(new Model("Px04", "Feora, Protector of the Flame", "caster", "C", new Array(eFeora), menothJacks));

addModel(new Model("PW05", "Amon Ad-Raza", "caster", "C", new Array(
		new ModelOption("p", "High Allegiant Amon Ad-Raza", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
	), menothJacks));
addModel(new Model("PW06", "Harbinger", "caster", "C", new Array(
		new ModelOption("p", "Harbinger of Menoth", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}])
	), menothJacks));
addModel(new Model("PW07", "Reznik", "caster", "C", new Array(
		new ModelOption("p", "High Executioner Servath Reznik", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
	), menothJacks));
addModel(new Model("PW08", "Vindictus", "caster", "C", new Array(
		new ModelOption("p", "Vice Scrutator Vindictus", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), menothJacks));
addModel(new Model("PW09", "Thyra", "caster", "C", new Array(
		new ModelOption("p", "Thyra, Flame of Sorrow", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}])
	), menothJacks));

addModel(new Model("PJ01", "Redeemer", "lightjack", "U", new Array(new ModelOption("p", "Redeemer", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("PJ02", "Repenter", "lightjack", "U", new Array(new ModelOption("p", "Repenter", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("PJ03", "Revenger", "lightjack", "U", new Array(new ModelOption("p", "Revenger", null, "xx..xxx....x.......LAAR.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("PJ04", "Devout", "lightjack", "U", new Array(new ModelOption("p", "Devout", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:5}])), null, true));
addModel(new Model("PJ05", "Dervish", "lightjack", "U", new Array(new ModelOption("p", "Dervish", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("PJ06", "Blessing of Vengeance", "lightjack", "C", new Array(new ModelOption("p", "Blessing of Vengeance", null, "xx..xxx....x.......LAAR.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("PJ07", "Crusader", "heavyjack", "U", new Array(new ModelOption("p", "Crusader", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("PJ08", "Vanquisher", "heavyjack", "U", new Array(new ModelOption("p", "Vanquisher", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("PJ09", "Guardian", "heavyjack", "U", new Array(new ModelOption("p", "Guardian", null, "...................LAAR.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("PJ10", "Reckoner", "heavyjack", "U", new Array(new ModelOption("p", "Reckoner", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("PJ11", "Avatar of Menoth", "heavyjack", "C", new Array(new ModelOption("p", "Avatar of Menoth", null, "x....x..................LLM.RRxLMMRx", [{name:'points', value:11}]))));
addModel(new Model("PJ12", "Castigator", "heavyjack", "U", new Array(new ModelOption("p", "Castigator", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("PJ13", "Fire of Salvation", "heavyjack", "C", new Array(new ModelOption("p", "Fire of Salvation", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("PJ14", "Templar", "heavyjack", "U", new Array(new ModelOption("p", "Templar", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("PJ15", "Vigilant", "lightjack", "U", new Array(new ModelOption("p", "Vigilant", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("PJ16", "Scourge of Heresy", "heavyjack", "C", new Array(new ModelOption("p", "Scourge of Heresy", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("PJ17", "Sanctifier", "heavyjack", "U", new Array(new ModelOption("p", "Sanctifier", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("PJ18", "Blood of Martyrs", "heavyjack", "C", new Array(new ModelOption("p", "Blood of Martyrs", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("PJ19", "Judicator", "heavyjack", "2", new Array(new ModelOption("p", "Judicator", null, new Array('Left',"xxxx..xx........SS.LLLSCLLCCCCLCMMMM",'Right',"..xxxx....xxSS....CSLLL.CCCCLLMMMMCL"), [{name:'points', value:18}])), null, true));

addModel(new Model("PE01", "Vessel of Judgement", "battleengine", "2", new Array(new ModelOption("p", "Vessel of Judgement", null, 24, [{name:'points', value:9}]))));

addModel(new Model("PS01", "Paladin of the Order of the Wall", "solo", "2", new Array(new ModelOption("p", "Paladin of the Order of the Wall", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS02", "Knight Exemplar Seneschal", "solo", "2", new Array(new ModelOption("p", "Knight Exemplar Seneschal", null, 5, [{name:'points', value:3}]))));
addModel(new Model("PS03", "The Wrack (3 wracks)", "solo", "1", new Array(new ModelOption("3", "The Wrack (3 wracks)", null, null, [{name:'points', value:1}]))));
addModel(new Model("PS04", "The Covenant of Menoth", "solo", "C", new Array(new ModelOption("p", "The Covenant of Menoth", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS05", "Reclaimer", "solo", "2", new Array(new ModelOption("p", "Reclaimer", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS06", "High Paladin Dartan Vilmon", "solo", "C", new Array(new ModelOption("p", "High Paladin Dartan Vilmon", null, 5, [{name:'points', value:3}]))));
addModel(new Model("PS07", "Allegiant of the Order of the Fist", "solo", "2", new Array(new ModelOption("p", "Allegiant of the Order of the Fist", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS08", "Hierophant", "solo", "1", new Array(new ModelOption("p", "Hierophant", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("PS09", "High Exemplar Gravus", "solo", "C", new Array(new ModelOption("m", "High Exemplar Gravus", new Array(1, "High Exemplar Gravus (mounted)", 1, "High Exemplar Gravus (dismounted)"), new Array("Mounted",10,"Dismounted",5), [{name:'points', value:5}]))));
addModel(new Model("PS10", "Vassal of Menoth", "solo", "2", new Array(new ModelOption("p", "Vassal of Menoth", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS11", "Exemplar Errant Seneschal", "solo", "2", new Array(new ModelOption("p", "Exemplar Errant Seneschal", null, 5, [{name:'points', value:2}]))));
addModel(new Model("PS12", "Vassal Mechanik", "solo", "3", new Array(new ModelOption("p", "Vassal Mechanik", null, 5, [{name:'points', value:1}]))));
addModel(new Model("PS13", "Nicia, Tear of Vengeance", "solo", "C", new Array(new ModelOption("p", "Nicia, Tear of Vengeance", null, 5, [{name:'points', value:3}]))));

addModel(new Model("PU01", "Choir of Menoth", "unit", "3", new Array(
		new ModelOption("4", "Choir of Menoth (Leader and 3 Grunts)", new Array(1, "Choir of Menoth Leader", 3, "Choir of Menoth Grunt"), null, [{name:'points', value:2}]),
		new ModelOption("6", "Choir of Menoth (Leader and 5 Grunts)", new Array(1, "Choir of Menoth Leader", 5, "Choir of Menoth Grunt"), null, [{name:'points', value:3}])
	)));

addModel(new Model("PU02", "Deliverers", "unit", "1", new Array(
		new ModelOption("6", "Deliverers (Leader and 5 Grunts)", new Array(1, "Deliverer Leader", 5, "Deliverer Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Deliverers (Leader and 9 Grunts)", new Array(1, "Deliverer Leader", 9, "Deliverer Grunt"), null, [{name:'points', value:8}])
	)));

addModel(new Model("PU03", "Holy Zealots", "unit", "3", new Array(
		new ModelOption("6", "Holy Zealots (Leader and 5 Grunts)", new Array(1, "Holy Zealot Leader", 5, "Holy Zealot Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Holy Zealots (Leader and 9 Grunts)", new Array(1, "Holy Zealot Leader", 9, "Holy Zealot Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "PA01")));
addModel(new Model("PA01", "Holy Zealot Monolith Bearer", "ua", "1", new Array(new ModelOption("p", "Holy Zealot Monolith Bearer", null, 5, [{name:'points', value:2}])), null, true));

addModel(new Model("PU04", "Knights Exemplar", "unit", "3", new Array(
		new ModelOption("6", "Knights Exemplar (Leader and 5 Grunts)", new Array(1, "Knight Exemplar Leader", 5, "Knight Exemplar Grunt"), null, [{name:'points', value:5}])
	)));

addModel(new Model("PU05", "Temple Flameguard", "unit", "3", new Array(
		new ModelOption("6", "Temple Flameguard (Leader and 5 Grunts)", new Array(1, "Temple Flameguard Leader", 5, "Temple Flameguard Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Temple Flameguard (Leader and 9 Grunts)", new Array(1, "Temple Flameguard Leader", 9, "Temple Flameguard Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "PA02")));
addModel(new Model("PA02", "Temple Flameguard Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Temple Flameguard Officer & Standard", new Array(1, "Temple Flameguard Officer", 1, "Temple Flameguard Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("PU06", "Deliverer Sunburst Crew", "unit", "2", new Array(
		new ModelOption("3", "Deliverer Sunburst Crew (Leader and 2 Grunts)", new Array(1, "Deliverer Sunburst Crew Leader", 2, "Deliverer Sunburst Crew Grunt"), null, [{name:'points', value:3}])
	)));

addModel(new Model("PU07", "Flameguard Cleansers", "unit", "2", new Array(
		new ModelOption("6", "Flameguard Cleansers (Leader and 5 Grunts)", new Array(1, "Flameguard Cleanser Leader", 5, "Flameguard Cleanser Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Flameguard Cleansers (Leader and 9 Grunts)", new Array(1, "Flameguard Cleanser Leader", 9, "Flameguard Cleanser Grunt"), null, [{name:'points', value:8}])
), new ChildGroup(1, "PA06")));
addModel(new Model("PA06", "Flameguard Cleanser Officer", "ua", "1", new Array(new ModelOption("p", "Flameguard Cleanser Officer", null, 5, [{name:'points', value:2}])), null, true));

addModel(new Model("PU08", "Daughters of the Flame", "unit", "2", new Array(
		new ModelOption("6", "Daughters of the Flame (Leader and 5 Grunts)", new Array(1, "Daughter of the Flame Leader", 5, "Daughter of the Flame Grunt"), null, [{name:'points', value:5}])
	)));

addModel(new Model("PU09", "Exemplar Errants", "unit", "3", new Array(
		new ModelOption("6", "Exemplar Errants (Leader and 5 Grunts)", new Array(1, "Exemplar Errant Leader", 5, "Exemplar Errant Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Exemplar Errants (Leader and 9 Grunts)", new Array(1, "Exemplar Errant Leader", 9, "Exemplar Errant Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "PA04")));

addModel(new Model("PU10", "Exemplar Vengers", "unit", "1", new Array(
		new ModelOption("3", "Exemplar Vengers (Leader and 2 Grunts)", new Array(1, "Exemplar Venger Leader", 2, "Exemplar Venger Grunt"), new Array("Venger A",5,"Venger B",5,"Venger C",5), [{name:'points', value:7}]),
		new ModelOption("5", "Exemplar Vengers (Leader and 4 Grunts)", new Array(1, "Exemplar Venger Leader", 4, "Exemplar Venger Grunt"), new Array("Venger A",5,"Venger B",5,"Venger C",5,"Venger D",5,"Venger E",5), [{name:'points', value:11}])
	)));
	
addModel(new Model("PU11", "Exemplar Bastions", "unit", "2", new Array(
		new ModelOption("3", "Exemplar Bastions (Leader and 2 Grunts)", new Array(1, "Exemplar Bastion Leader", 2, "Exemplar Bastion Grunt"), new Array("Bastion A",8,"Bastion B",8,"Bastion C",8), [{name:'points', value:5}]),
		new ModelOption("5", "Exemplar Bastions (Leader and 4 Grunts)", new Array(1, "Exemplar Bastion Leader", 4, "Exemplar Bastion Grunt"), new Array("Bastion A",8,"Bastion B",8,"Bastion C",8,"Bastion D",8,"Bastion E",8), [{name:'points', value:8}])
	)));
	
addModel(new Model("PU12", "Visgoth Juviah Rhoven & Honor Guard", "unit", "C", new Array(
		new ModelOption("3", "Visgoth Juviah Rhoven & 2 Honor Guard", new Array(1, "Visgoth Juviah Rhoven", 2, "Honor Guard"), new Array("Rhoven",5,"Guis",5,"Cassian",5), [{name:'points', value:4}])
	)));

addModel(new Model("PU13", "Idrian Skirmishers", "unit", "2", new Array(
		new ModelOption("6", "Idrian Skirmishers (Leader and 5 Grunts)", new Array(1, "Idrian Skirmisher Leader", 5, "Idrian Skirmisher Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Idrian Skirmishers (Leader and 9 Grunts)", new Array(1, "Idrian Skirmisher Leader", 9, "Idrian Skirmisher Grunt"), null, [{name:'points', value:10}])
	), new ChildGroup(1, "PA03")));
addModel(new Model("PA03", "Idrian Skirmishers Chieftain & Guide", "ua", "1", new Array(new ModelOption("2", "Idrian Skirmishers Chieftain & Guide", new Array(1, "Idrian Skirmisher Chieftain", 1, "Idrian Skirmisher Guide"), new Array("Chieftain", 5, "Guide", 5), [{name:'points', value:3}])), null, true));
	
addModel(new Model("PU14", "Exemplar Cinerators", "unit", "2", new Array(
		new ModelOption("3", "Exemplar Cinerators (Leader and 2 Grunts)", new Array(1, "Exemplar Cinerator Leader", 2, "Exemplar Cinerator Grunt"), new Array("Cinerator A",8,"Cinerator B",8,"Cinerator C",8), [{name:'points', value:5}]),
		new ModelOption("5", "Exemplar Cinerators (Leader and 4 Grunts)", new Array(1, "Exemplar Cinerator Leader", 4, "Exemplar Cinerator Grunt"), new Array("Cinerator A",8,"Cinerator B",8,"Cinerator C",8,"Cinerator D",8,"Cinerator E",8), [{name:'points', value:8}])
	)));
	
addModel(new Model("PA04", "Exemplar Errant Officer & Standard Bearer", "ua", "1", new Array(new ModelOption("2", "Exemplar Errant Officer & Standard Bearer", new Array(1, "Exemplar Errant Officer", 1, "Exemplar Errant Standard Bearer"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("PA05", "Attendant Priest", "ua", "2", new Array(new ModelOption("p", "Attendant Priest", null, 5, [{name:'points', value:2}])), null, true));var khadorColors = new Array("#ecbd23","#990000");
var khadorFaction = new Faction("Khador", "K", khadorColors);
factions.push(khadorFaction);

var khadorJacks = [new ChildGroup(1, "KS08 MS23"), new ChildGroup(99, "KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ09 KJ10 KJ11 KJ12 KJ13 KJ14 KJ15")];
var khadorJacksWithVanguard = [new ChildGroup(1, "KS08 MS23"), new ChildGroup(99, "KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ09 KJ10 KJ11 KJ12 KJ13 KJ14 KJ15 MJ03")];
var khadorMarshalledJacks = new ChildGroup(2, "KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13");

var butcher = new ModelOption("p", "The Butcher of Khardov", null, 20, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eButcher = new ModelOption("e", "Kommander Orsus Zoktavir", null, 20, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("KW01", "Butcher", "caster", "C", new Array(butcher, eButcher), khadorJacks));
addModel(new Model("Kw01", "The Butcher of Khardov", "caster", "C", new Array(butcher), khadorJacks));
addModel(new Model("Kx01", "Kommander Orsus Zoktavir", "caster", "C", new Array(eButcher), khadorJacks));

var sorcha = new ModelOption("p", "Kommander Sorscha", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eSorcha = new ModelOption("e", "Forward Kommander Sorscha", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("KW02", "Sorscha", "caster", "C", new Array(sorcha, eSorcha), khadorJacks));
addModel(new Model("Kw02", "Kommander Sorscha", "caster", "C", new Array(sorcha), khadorJacks));
addModel(new Model("Kx02", "Forward Kommander Sorscha", "caster", "C", new Array(eSorcha), khadorJacks));

//check HP and WJ points on vlad3
var vlad = new ModelOption("p", "Vladimir, The Dark Prince", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eVlad = new ModelOption("e", "Vladimir Tzepesci, the Dark Champion", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
var lVlad = new ModelOption("l", "Vladimir Tzepesci, Great Prince of Umbrey", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("KW03", "Vladimir", "caster", "C", new Array(vlad, eVlad,lVlad), khadorJacks));
addModel(new Model("Kw03", "Vladimir, The Dark Prince", "caster", "C", new Array(vlad), khadorJacks));
addModel(new Model("Kx03", "Vladimir Tzepesci, the Dark Champion", "caster", "C", new Array(eVlad), khadorJacks));
addModel(new Model("Kz03", "Vladimir Tzepesci, Great Prince of Umbrey", "caster", "C", new Array(lVlad), khadorJacks));

var irusk = new ModelOption("p", "Kommandant Irusk", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eIrusk = new ModelOption("e", "Supreme Kommandant Irusk", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("KW04", "Irusk", "caster", "C", new Array(irusk, eIrusk), khadorJacks));
addModel(new Model("Kw04", "Kommandant Irusk", "caster", "C", new Array(irusk), khadorJacks));
addModel(new Model("Kx04", "Supreme Kommandant Irusk", "caster", "C", new Array(eIrusk), khadorJacks));

addModel(new Model("KW05", "Karchev", "caster", "C", new Array(
		new ModelOption("p", "Karchev the Terrible", null, "...................L..R.LLMBRRxMMBBx", [{name:'points', value:-5}, {name:"casters", value:1}])
	), khadorJacks));

addModel(new Model("KW06", "Zerkova", "caster", "C", new Array(
		new ModelOption("p", "Koldun Kommander Aleksandra Zerkova", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), khadorJacks));
addModel(new Model("Ky06", "Zerkova", "caster", "C", new Array(
		new ModelOption("p", "Koldun Kommander Aleksandra Zerkova", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), khadorJacksWithVanguard));

addModel(new Model("KW07", "Old Witch", "caster", "C", new Array(
		new ModelOption("2", "Zevanna Agha, the Old Witch of Khador", new Array(1, "Zevanna Agha, Old Witch of Khador", 1, "Scrapjack"), new Array("Zevanna", 16, "Scrapjack", "xxxxxxxx..xxx....x......MCAACMxMCCMx"),[{name:'points', value:-3}, {name:"casters", value:1}])
	), khadorJacks));
addModel(new Model("KW08", "Strakhov", "caster", "C", new Array(
		new ModelOption("p", "Kommander Strakhov", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
	), khadorJacks));
addModel(new Model("KW09", "Harkevich", "caster", "C", new Array(
		new ModelOption("p", "Kommander Harkevich, the Iron Wolf", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])
	), khadorJacks));

addModel(new Model("KJ01", "Destroyer", "heavyjack", "U", new Array(new ModelOption("p", "Destroyer", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("KJ02", "Juggernaut", "heavyjack", "U", new Array(new ModelOption("p", "Juggernaut", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("KJ03", "Marauder", "heavyjack", "U", new Array(new ModelOption("p", "Marauder", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("KJ04", "Berserker", "heavyjack", "U", new Array(new ModelOption("p", "Berserker", null, "x....x.............L..R.LLMCRRxMMxCx", [{name:'points', value:6}])), null, true));
addModel(new Model("KJ05", "Devastator", "heavyjack", "U", new Array(new ModelOption("p", "Devastator", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("KJ06", "Kodiak", "heavyjack", "U", new Array(new ModelOption("p", "Kodiak", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("KJ07", "Behemoth", "heavyjack", "C", new Array(new ModelOption("p", "Behemoth", null, "....................SS..LLMCRRLMMCCR", [{name:'points', value:13}])), null, true));
addModel(new Model("KJ08", "Spriggan", "heavyjack", "U", new Array(new ModelOption("p", "Spriggan", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("KJ09", "Beast-09", "heavyjack", "C", new Array(new ModelOption("p", "Beast-09", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:11}])), null, true));
addModel(new Model("KJ10", "Drago", "heavyjack", "C", new Array(new ModelOption("p", "Drago", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("KJ11", "Decimator", "heavyjack", "U", new Array(new ModelOption("p", "Decimator", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("KJ12", "Torch", "heavyjack", "C", new Array(new ModelOption("p", "Torch", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("KJ13", "Demolisher", "heavyjack", "U", new Array(new ModelOption("p", "Demolisher", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("KJ14", "Black Ivan", "heavyjack", "C", new Array(new ModelOption("p", "Black Ivan", null, "...................L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("KJ15", "Conquest", "heavyjack" , "2" , new Array(new ModelOption("p", "Conquest", null, new Array('Left',"xxx...xx........SS.LLLSCLLCCCCLCMMMM",'Right',"...xxx....xxSS....CSLLL.CCCCLLMMMMCL"), [{name:'points', value:19}])), null, true));

addModel(new Model("KE01", "Gun Carriage", "battleengine", "2", new Array(new ModelOption("p", "Gun Carriage", null, 22, [{name:'points', value:9}]))));

addModel(new Model("KS01", "Manhunter", "solo", "2", new Array(new ModelOption("p", "Manhunter", null, 5, [{name:'points', value:2}]))));
addModel(new Model("KS02", "Man-o-war Kovnik", "solo", "2", new Array(new ModelOption("p", "Man-o-war Kovnik", null, 8, [{name:'points', value:3}])), khadorMarshalledJacks, null, null, "KU04 KU12"));
addModel(new Model("KS03", "Kovnik Jozef Grigorovich", "solo", "C", new Array(new ModelOption("p", "Kovnik Jozef Grigorovich", null, 5, [{name:'points', value:2}]))));
addModel(new Model("KS04", "Man-o-war Drakhun", "solo", "1", new Array(
		new ModelOption("m", "Man-o-war Drakhun (without dismount)", new Array(1, "Man-o-war Drakhun (mounted)"), new Array("Mounted",10), [{name:'points', value:4}]),
		new ModelOption("d", "Man-o-war Drakhun (with dismount)", new Array(1, "Man-o-war Drakhun (dismounted)", 1, "Man-o-war Drakhun (mounted)"), new Array("Mounted",10,"Dismounted",8), [{name:'points', value:5}])
	)));
addModel(new Model("KS05", "Fenris", "solo", "C", new Array(new ModelOption("p", "Fenris", new Array(1, "Fenris (dismounted)", 1, "Fenris (mounted)"), new Array("Mounted",10,"Dismounted",5), [{name:'points', value:5}]))));
addModel(new Model("KS06", "Koldun Lord", "solo", "1", new Array(new ModelOption("p", "Koldun Lord", null, 5, [{name:'points', value:2}])), khadorMarshalledJacks));
addModel(new Model("KS07", "Kovnik Markov", "solo", "C", new Array(new ModelOption("m", "Kovnik Markov", null, 10, [{name:'points', value:4}]))));
addModel(new Model("KS08", "War Dog", "solo", "1", new Array(new ModelOption("p", "War dog", null, 5, [{name:'points', value:1}])), null, true));
addModel(new Model("KS09", "Yuri the Axe", "solo", "C", new Array(new ModelOption("p", "Yuri the Axe", null, 5, [{name:'points', value:3}]))));
addModel(new Model("KS10", "Widowmaker Marksman", "solo", "1", new Array(new ModelOption("p", "Widowmaker Marksman", null, 5, [{name:'points', value:2}]))));

addModel(new Model("KU01", "Battle Mechaniks", "unit", "3", new Array(
		new ModelOption("4", "Battle Mechaniks (Leader and 3 Grunts)", new Array(1, "Battle Mechanik Leader", 3, "Battle Mechaniks Grunt"), null, [{name:'points', value:2}]),
		new ModelOption("6", "Battle Mechaniks (Leader and 5 Grunts)", new Array(1, "Battle Mechanik Leader", 5, "Battle Mechaniks Grunt"), null, [{name:'points', value:3}])
	), [new ChildGroup(1, "KA08"), khadorMarshalledJacks]));
addModel(new Model("KA08", "Battle Mechanik Officer", "ua", "2", new Array(new ModelOption("1", "Battle Mechanik Officer", null, 8, [{name:'points', value:2}])), null, true));

addModel(new Model("KU02", "Doom Reavers", "unit", "2", new Array(
		new ModelOption("6", "Doom Reavers (Leader and 5 Grunts)", new Array(1, "Doom Reaver Leader", 5, "Doom Reaver Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "KA06")));
addModel(new Model("KA06", "Greylord Escort", "ua", "1", new Array(new ModelOption("1", "Greylord Escort", null, 5, [{name:'points', value:2}])), null, true));

addModel(new Model("KU03", "Iron Fang Pikemen", "unit", "2", new Array(
		new ModelOption("6", "Iron Fang Pikemen (Leader and 5 Grunts)", new Array(1, "Iron Fang Pikemen Leader", 5, "Iron Fang Pikemen Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Iron Fang Pikemen (Leader and 9 Grunts)", new Array(1, "Iron Fang Pikemen Leader", 9, "Iron Fang Pikemen Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "KA01 KA09")));
addModel(new Model("KA01", "Iron Fang Pikemen Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Iron Fang Pikemen Officer & Standard", new Array(1, "Iron Fang Pikemen Officer", 1, "Iron Fang Pikemen Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("KA09", "Black Dragon Officer & Standard", "ua", "2", new Array(new ModelOption("2", "Black Dragon Officer & Standard", new Array(1, "Black Dragon Officer", 1, "Black Dragon Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("KU04", "Man-o-war Shocktroopers", "unit", "3", new Array(
		new ModelOption("3", "Man-o-war Shocktroopers (Leader and 2 Grunts)", new Array(1, "Man-o-war Shocktrooper Leader", 3, "Man-o-war Shocktrooper Grunt"), new Array("Shocktrooper A",8,"Shocktrooper B",8,"Shocktrooper C",8), [{name:'points', value:6}]),
		new ModelOption("5", "Man-o-war Shocktroopers (Leader and 4 Grunts)", new Array(1, "Man-o-war Shocktrooper Leader", 5, "Man-o-war Shocktrooper Grunt"), new Array("Shocktrooper A",8,"Shocktrooper B",8,"Shocktrooper C",8,"Shocktrooper D",8,"Shocktrooper E",8), [{name:'points', value:9}])
	)));

addModel(new Model("KU05", "Widowmakers", "unit", "1", new Array(
		new ModelOption("4", "Widowmakers (Leader and 3 Grunts)", new Array(1, "Widowmaker Leader", 3, "Widowmaker Grunt"), null, [{name:'points', value:4}])
	)));

addModel(new Model("KU06", "Winter Guard Infantry", "unit", "3", new Array(
		new ModelOption("6", "Winter Guard Infantry (Leader and 5 Grunts)", new Array(1, "Winter Guard Infantry Leader", 5, "Winter Guard Infantry Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Winter Guard Infantry (Leader and 9 Grunts)", new Array(1, "Winter Guard Infantry Leader", 9, "Winter Guard Infantry Grunt"), null, [{name:'points', value:6}])
	), new Array(new ChildGroup(1, "KA02"), new ChildGroup(1, "KA03"))));
addModel(new Model("KA02", "Winter Guard Inf. Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Winter Guard Infantry Officer & Standard", new Array(1,"Winter Guard Infantry Officer", 1, "Winter Guard Infantry Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("KA03", "Winter Guard Infantry Rocketeer", "ua", "2", new Array(
		new ModelOption("1", "1 Winter Guard Infantry Rocketeer", new Array(1, "Winter Guard Infantry Rocketeer"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Winter Guard Infantry Rocketeers", new Array(2, "Winter Guard Infantry Rocketeer"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Winter Guard Infantry Rocketeers", new Array(3, "Winter Guard Infantry Rocketeer"), null, [{name:'points', value:3}])
	), null, true));

addModel(new Model("KU07", "Greylord Ternion", "unit", "3", new Array(
		new ModelOption("3", "Greylord Ternion (Leader and 2 Grunts)", new Array(1, "Greylord Ternion Leader", 1, "Greylord Ternion Grunt"), null, [{name:'points', value:4}])
	)));

addModel(new Model("KU08", "Kossite Woodsmen", "unit", "2", new Array(
		new ModelOption("6", "Kossite Woodsmen (Leader and 5 Grunts)", new Array(1, "Kossite Woodsman Leader", 5, "Kossite Woodsman Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Kossite Woodsmen (Leader and 9 Grunts)", new Array(1, "Kossite Woodsman Leader", 9, "Kossite Woodsman Grunt"), null, [{name:'points', value:6}])
	)));

addModel(new Model("KU09", "Winter Guard Mortar Crew", "unit", "2", new Array(
		new ModelOption("2", "Winter Guard Mortar Crew (Leader and Grunt)", new Array(1, "Winter Guard Mortar Crew Leader", 1, "Winter Guard Mortar Crew Grunt"), null, [{name:'points', value:3}])
	)));

addModel(new Model("KU10", "Assault Kommandos", "unit", "2", new Array(
		new ModelOption("6", "Assault Kommandos (Leader and 5 Grunts)", new Array(1, "Assault Kommando Leader", 5, "Assault Kommando Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Assault Kommandos (Leader and 9 Grunts)", new Array(1, "Assault Kommando Leader", 9, "Assault Kommando Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "KA05")));
addModel(new Model("KU11", "Iron Fang Uhlans", "unit", "1", new Array(
		new ModelOption("3", "Iron Fang Uhlans (Leader and 2 Grunts)", new Array(1, "Iron Fang Uhlan Leader", 2, "Iron Fang Uhlan Grunt"), new Array("Uhlan A",5,"Uhlan B",5,"Uhlan C",5), [{name:'points', value:7}]),
		new ModelOption("5", "Iron Fang Uhlans (Leader and 4 Grunts)", new Array(1, "Iron Fang Uhlan Leader", 4, "Iron Fang Uhlan Grunt"), new Array("Uhlan A",5,"Uhlan B",5,"Uhlan C",5,"Uhlan D",5,"Uhlan E",5), [{name:'points', value:11}])
	)));
	
addModel(new Model("KU12", "Man-o-war Demolition Corps", "unit", "3", new Array(
		new ModelOption("3", "Man-o-war Demolition Corps (Leader and 2 Grunts)", new Array(1, "Man-o-war Demolition Corps Leader", 2, "Man-o-war Demolition Corps Grunt"), new Array("Demolisher A",8,"Demolisher B",8,"Demolisher C",8), [{name:'points', value:6}]),
		new ModelOption("5", "Man-o-war Demolition Corps (Leader and 4 Grunts)", new Array(1, "Man-o-war Demolition Corps Leader", 4, "Man-o-war Demolition Corps Grunt"), new Array("Demolisher A",8,"Demolisher B",8,"Demolisher C",8,"Demolisher D",8,"Demolisher E",8), [{name:'points', value:9}])
	)));

addModel(new Model("KU13", "Winter Guard Field Gun Crew", "unit", "2", new Array(
		new ModelOption("2", "Winter Guard Field Gun Crew (Leader and 2 Grunts)", new Array(1, "Winter Guard Field Gun Crew Leader", 1, "Winter Guard Field Gun Crew Grunt"), null, [{name:'points', value:2}])
	)));

addModel(new Model("KU14", "Great Bears of Gallowswood", "unit", "C", new Array(
		new ModelOption("3", "Great Bears of Gallowswood", new Array(3, "Great Bear of Gallowswood"), new Array("Volkov",5,"Kolsk",5,"Yarovich",5), [{name:'points', value:5}])
	)));

addModel(new Model("KU15", "Kayazy Assassins", "unit", "2", new Array(
		new ModelOption("6", "Kayazy Assassins (Leader and 5 Grunts)", new Array(1, "Kayazy Assassin Leader", 5, "Kayazy Assassin Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Kayazy Assassins (Leader and 9 Grunts)", new Array(1, "Kayazy Assassin Leader", 9, "Kayazy Assassin Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "KA04")));
addModel(new Model("KA04", "Kayazy Assassin Underboss", "ua", "1", new Array(new ModelOption("p", "Kayazy Assassin Underboss", null, 5, [{name:'points', value:2}])), null, true));

addModel(new Model("KA05", "Assault Kommando Flame Thrower", "ua", "2", new Array(
		new ModelOption("1", "1 Assault Kommando Flame Thrower", new Array(1, "Assault Kommando Flame Thrower"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Assault Kommando Flame Throwers", new Array(2, "Assault Kommando Flame Thrower"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Assault Kommando Flame Throwers", new Array(3, "Assault Kommando Flame Thrower"), null, [{name:'points', value:3}])
	), null, true));
	
addModel(new Model("KU16", "Man-o-war Bombardiers", "unit", "1", new Array(
		new ModelOption("3", "Man-o-war Bombardiers (Leader and 2 Grunts)", new Array(1, "Man-o-war Bombardiers Leader", 2, "Man-o-war Bombardiers Grunt"), new Array("Bombardier A",8,"Bombardier B",8,"Bombardier C",8), [{name:'points', value:7}]),
		new ModelOption("5", "Man-o-war Bombardiers (Leader and 4 Grunts)", new Array(1, "Man-o-war Bombardiers Leader", 4, "Man-o-war Bombardiers Grunt"), new Array("Bombardier A",8,"Bombardier B",8,"Bombardier C",8,"Bombardier D",8,"Bombardier E",8), [{name:'points', value:11}])
	)));

addModel(new Model("KU17", "Winter Guard Rifle Corps", "unit", "3", new Array(
		new ModelOption("6", "Winter Guard Rifle Corps (Leader and 5 Grunts)", new Array(1, "Winter Guard Rifle Corps Leader", 5, "Winter Guard Rifle Corps Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Winter Guard Rifle Corps (Leader and 9 Grunts)", new Array(1, "Winter Guard Rifle Corps Leader", 9, "Winter Guard Rifle Corps Grunt"), null, [{name:'points', value:8}])
	)));

addModel(new Model("KU18", "Kayazy Eliminators", "unit", "2", new Array(
		new ModelOption("2", "Kayazy Eliminators (Leader and Grunt)", new Array(1, "Kayazy Eliminator Leader", 1, "Kayazy Eliminator Grunt"), new Array("Eliminator A",5,"Eliminator B",5), [{name:'points', value:3}])
	)));

addModel(new Model("KA07", "Koldun Kapitan Valachev", "ua", "C", new Array(new ModelOption("p", "Koldun Kapitan Valachev", null, 5, [{name:'points', value:2}])), null, true));
var retributionColors = new Array("#FFFFFF","#40877C");
var retributionFaction = new Faction("Retribution of Scyrah", "R", retributionColors);
factions.push(retributionFaction);

var retributionJacks = new ChildGroup(99, "RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ07 RJ08 RJ09 RJ10 RJ11 RJ12 RJ13 MS23");
var retributionMarshallJacks = new ChildGroup(2, "RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11");

addModel(new Model("RW01", "Adeptis Rahn Shyeel", "caster",  "C", new Array(
		new ModelOption("p", "Adeptis Rahn Shyeel", null,  16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), retributionJacks));
        

var pVyros = new ModelOption("p", "Dawnlord Vyros", null,  18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eVyros = new ModelOption("e", "Vyros, Incissar of the Dawnguard", null,  18, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("RW02","Vyros", "caster" , "C" , new Array(pVyros,eVyros),retributionJacks));
addModel(new Model("Rw02", "Dawnlord Vyros", "caster", "C" , new Array(pVyros),retributionJacks));
addModel(new Model("Rx02" , "Vyros, Incissar of the Dawnguard", "caster", "C" , new Array(eVyros),retributionJacks));
                                           
addModel(new Model("RW03", "Garryth, Blade of Retribution", "caster",  "C", new Array(
		new ModelOption("p", "Garryth, Blade of Retribution", null,  16, [{name:'points', value:-5}, {name:"casters", value:1}])
	), retributionJacks));
addModel(new Model("RW04", "Kaelyssa, Night's Whisper", "caster",  "C", new Array(
		new ModelOption("p", "Kaelyssa, Night's Whisper", null,  16, [{name:'points', value:-7}, {name:"casters", value:1}])
	), retributionJacks));
addModel(new Model("RW05", "Ravyn, Eternal Light", "caster",  "C", new Array(
		new ModelOption("p", "Ravyn, Eternal Light", null,  16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), retributionJacks));
addModel(new Model("RW06", "Ossyan", "caster",  "C", new Array(
		new ModelOption("p", "Lord Arcanist Ossyan", null,  16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), retributionJacks));

addModel(new Model("RJ01", "Chimera", "lightjack",  "U", new Array(new ModelOption("p", "Chimera", null,  new Array("Forcefield", 6, "","xxxxxxxx..xxx.AA.x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:6}])), null, true));
addModel(new Model("RJ02", "Gorgon", "lightjack",  "U", new Array(new ModelOption("p", "Gorgon", null,  new Array("Forcefield", 6, "","xxxxxxxxxxxxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:5}])), null, true));
addModel(new Model("RJ03", "Griffon", "lightjack",  "U", new Array(new ModelOption("p", "Griffon", null,  new Array("Forcefield", 6, "","xxxxxxxxxxxxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:4}])), null, true));
addModel(new Model("RJ04", "Hydra", "heavyjack",  "U", new Array(new ModelOption("p", "Hydra", null,  new Array("Forcefield", 10, "","xxxxxxxx..xxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:9}])), null, true));
addModel(new Model("RJ05", "Manticore", "heavyjack",  "U", new Array(new ModelOption("p", "Manticore", null,  new Array("Forcefield", 10, "","xxxxxxxx..xxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:8}])), null, true));
addModel(new Model("RJ06", "Phoenix", "heavyjack",  "U", new Array(new ModelOption("p", "Phoenix", null,  new Array("Forcefield", 10, "","xxxxxxx....xx.AA.x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:10}])), null, true));
addModel(new Model("RJ07", "Discordia", "heavyjack",  "C", new Array(new ModelOption("p", "Discordia", null,  new Array("Forcefield", 10, "","xxxxxxxx..xxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:10}])), null, true));
addModel(new Model("RJ08", "Aspis", "lightjack",  "U", new Array(new ModelOption("p", "Aspis", null,  new Array("Forcefield", 10, "","xxxxxxxxxxxxx....x.LGGR.LLMCRRxMMCCx"), [{name:'points', value:4}])), null, true));
addModel(new Model("RJ09", "Banshee", "heavyjack",  "U", new Array(new ModelOption("p", "Banshee", null,  "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:10}])), null, true));
addModel(new Model("RJ10", "Daemon", "heavyjack",  "U", new Array(new ModelOption("p", "Daemon", null,  "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("RJ11", "Sphinx", "heavyjack",  "U", new Array(new ModelOption("p", "Sphinx", null,  "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:7}])), null, true));
addModel(new Model("RJ12", "Hypnos", "heavyjack",  "C", new Array(new ModelOption("p", "Hypnos", null,  "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("RJ13", "Hyperion", "heavyjack",  "2", new Array(new ModelOption("p", "Hyperion", null, new Array('Shield',12,'Left',"xxxxxxxxx...x..GGG.LLGCCLLCCCCLCMMMM",'Right', "xxxxxx...xxxGGG..xCCGRR.CCCCRRMMMMCR"), [{name:'points', value:18}])), null, true));

addModel(new Model("RE01", "Arcantrik Force Generator", "battleengine", "2", new Array(new ModelOption("p", "Arcantrik Force Generator", null, 20, [{name:'points', value:10}]))));

addModel(new Model("RU01", "Dawnguard Invictors", "unit",  "2", new Array(
		new ModelOption("6", "Dawnguard Invictors (Leader and 5 Grunts)", new Array(1, "Dawnguard Invictor Leader", 5, "Dawnguard Invictor Grunt"),  null, [{name:'points', value:6}]),
		new ModelOption("10", "Dawnguard Invictors (Leader and 9 Grunts)", new Array(1, "Dawnguard Invictor Leader", 9, "Dawnguard Invictor Grunt"),  null, [{name:'points', value:10}])
), new Array(new ChildGroup(1, "RA01"), new ChildGroup(1, "RA04"), retributionMarshallJacks)));
addModel(new Model("RA01", "Dawnguard Invictor Officer & Standard", "ua",  "1", new Array(new ModelOption("p", "Dawnguard Invictor Officer & Standard", new Array(1, "Dawnguard Invictor Officer", 1, "Dawnguard Invictor Standard"),  new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("RU02", "Dawnguard Sentinels", "unit",  "2", new Array(
		new ModelOption("6", "Dawnguard Sentinels (Leader and 5 Grunts)", new Array(1, "Dawnguard Sentinel Leader", 5, "Dawnguard Sentinel Grunt"),  null, [{name:'points', value:6}]),
		new ModelOption("10", "Dawnguard Sentinels (Leader and 9 Grunts)", new Array(1, "Dawnguard Sentinel Leader", 9, "Dawnguard Sentinel Grunt"),  null, [{name:'points', value:9}])
), new Array(new ChildGroup(1, "RA02"), new ChildGroup(1, "RA04"), retributionMarshallJacks)));
addModel(new Model("RA02", "Dawnguard Sentinel Officer & Standard", "ua",  "1", new Array(new ModelOption("p", "Dawnguard Sentinel Officer & Standard", new Array(1, "Dawnguard Sentinel Officer", 1, "Dawnguard Sentinel Standard"),  new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("RU03", "House Shyeel Battle Mages", "unit",  "2", new Array(
		new ModelOption("6", "House Shyeel Battle Mages (Leader and 5 Grunts)", new Array(1, "House Shyeel Battle Mage Leader", 5, "House Shyeel Battle Mage Grunt"),  null, [{name:'points', value:5}])
), new ChildGroup(1, "RA04")));
addModel(new Model("RU04", "Houseguard Riflemen", "unit",  "3", new Array(
		new ModelOption("6", "Houseguard Riflemen (Leader and 5 Grunts)", new Array(1, "Houseguard Rifleman Leader", 5, "Houseguard Rifleman Grunt"),  null, [{name:'points', value:5}]),
		new ModelOption("10", "Houseguard Riflemen (Leader and 9 Grunts)", new Array(1, "Houseguard Rifleman Leader", 9, "Houseguard Rifleman Grunt"),  null, [{name:'points', value:8}])
), new Array(new ChildGroup(1, "RA06"), new ChildGroup(1, "RA04"))));
addModel(new Model("RA06", "Riflemen Officer & Standard", "ua",  "1", new Array(new ModelOption("p", "Houseguard Riflemen Officer & Standard", new Array(1, "Houseguard Rifleman Officer", 1, "Houseguard Rifleman Standard"),  new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("RU05", "Mage Hunter Strikeforce", "unit",  "2", new Array(
		new ModelOption("6", "Mage Hunter Strikeforce (Leader and 5 Grunts)", new Array(1, "Mage Hunter Strikeforce Leader", 5, "Mage Hunter Strikeforce Grunt"),  null, [{name:'points', value:5}]),
		new ModelOption("10", "Mage Hunter Strikeforce (Leader and 9 Grunts)", new Array(1, "Mage Hunter Strikeforce Leader", 9, "Mage Hunter Strikeforce Grunt"),  null, [{name:'points', value:8}])
), new Array(new ChildGroup(1, "RA03"), new ChildGroup(1, "RA04"))));
addModel(new Model("RA03", "Mage Hunter Commander", "ua",  "1", new Array(new ModelOption("p", "Mage Hunter Commander", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("RA04", "Soulless Escort", "ua",  "3", new Array(new ModelOption("1", "Soulless Escort", null, 5, [{name:'points', value:1}]),new ModelOption("2", "2 Soulless Escort", null, 5, [{name:'points', value:2}]),new ModelOption("3", "3 Soulless Escorts", null, null, [{name:'points', value:3}])), null, true));

addModel(new Model("RU06", "Dawnguard Destors", "unit",  "1", new Array(
		new ModelOption("3", "Dawnguard Destors (Leader and 2 Grunts)", new Array(1, "Dawnguard Destor Leader", 2, "Dawnguard Destor Grunt"),  new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:7}]),
		new ModelOption("5", "Dawnguard Destors (Leader and 4 Grunts)", new Array(1, "Dawnguard Destor Leader", 4, "Dawnguard Destor Grunt"),  new Array("Model a", 5, "Model b", 5, "Model c", 5, "Model d", 5, "Model e", 5), [{name:'points', value:11}])
), new ChildGroup(1, "RA04")));
addModel(new Model("RU07", "Houseguard Halberdiers", "unit",  "3", new Array(
		new ModelOption("6", "Houseguard Halberdiers (Leader and 5 Grunts)", new Array(1, "Houseguard Halberdier Leader", 5, "Houseguard Halberdier Grunt"),  null, [{name:'points', value:4}]),
		new ModelOption("10", "Houseguard Halberdiers (Leader and 9 Grunts)", new Array(1, "Houseguard Halberdier Leader", 9, "Houseguard Halberdier Grunt"),  null, [{name:'points', value:7}])
), new Array(new ChildGroup(1, "RA05"), new ChildGroup(1, "RA04"))));
addModel(new Model("RA05", "Houseguard Halberdiers Officer & Standard", "ua",  "1", new Array(new ModelOption("p", "Houseguard Halberdiers Officer & Standard", new Array(1, "Houseguard Halberdier Officer", 1, "Houseguard Halberdier Standard"),  new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("RU08", "Stormfall Archers", "unit",  "2", new Array(
		new ModelOption("4", "Stormfall Archers (Leader and 3 Grunts)", new Array(1, "Stormfall Archer Leader", 3, "Stormfall Archer Grunt"),  null, [{name:'points', value:5}])
), new ChildGroup(1, "RA04")));
addModel(new Model("RU09", "Heavy Rifle Team", "unit",  "2", new Array(
		new ModelOption("2", "Heavy Rifle Team (Leader and Grunts)", new Array(1, "Heavy Rifle Team Leader", 1, "Heavy Rifle Team Grunt"),  null, [{name:'points', value:2}])
), new ChildGroup(1, "RA04")));



addModel(new Model("RS01", "Arcanist", "solo",  "2", new Array(new ModelOption("p", "Arcanist", null, null, [{name:'points', value:1}]))));
addModel(new Model("RS02", "Dawnguard Scyir", "solo",  "2", new Array(new ModelOption("p", "Dawnguard Scyir", null, 5, [{name:'points', value:2}])), retributionMarshallJacks));
addModel(new Model("RS03", "Ghost Sniper", "solo",  "2", new Array(new ModelOption("p", "Ghost Sniper", null, 5, [{name:'points', value:2}]))));
addModel(new Model("RS04", "House Shyeel Magister", "solo",  "2", new Array(new ModelOption("p", "House Shyeel Magister", null, 5, [{name:'points', value:2}]))));
addModel(new Model("RS05", "Mage Hunter Assassin", "solo",  "2", new Array(new ModelOption("p", "Mage Hunter Assassin", null, 5, [{name:'points', value:2}]))));
addModel(new Model("RS06", "Narn, Mage Hunter of Ios", "solo",  "C", new Array(new ModelOption("p", "Narn, Mage Hunter of Ios", null, 5, [{name:'points', value:3}]))));
addModel(new Model("RS07", "Nayl", "solo",  "C", new Array(new ModelOption("p", "Nayl", null, 5, [{name:'points', value:2}]))));
addModel(new Model("RS08", "Dawnguard Destor Thane", "solo",  "2", new Array(new ModelOption("m", "Dawnguard Destor Thane", null, 10, [{name:'points', value:4}]))));
addModel(new Model("RS10", "Fane Knight Skeryth Issyen", "solo",  "C", new Array(new ModelOption("m", "Fane Knight Skeryth Issyen", null, new Array("mounted", 10, "dismounted", 5), [{name:'points', value:5}]))));
addModel(new Model("RS11", "House Shyeel Artificer", "solo",  "2", new Array(new ModelOption("p", "House Shyeel Artificer", null, 8, [{name:'points', value:3}]))));
var mercColors = new Array("#F9C935", "#2B0100");
var mercFaction = new Faction("Mercenaries", "M", mercColors);
factions.push(mercFaction);

var mercJacks = new ChildGroup(99, "MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 MJ18 YJ17 MS23");
var mercJacksMagnus = new ChildGroup(99, "MJ01 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 MJ18 YJ17 MS23");
var mercRhulicJacks = new ChildGroup(99, "MJ05 MJ06 MJ07 MJ08 MJ14 MJ15 MS23");
var mercShaeJacks = new ChildGroup(99, "MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 MJ18 YJ17 MU10 MS23");
var mercJacksWithCygnar = new ChildGroup(99, "MJ01 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 MJ18 YJ01 YJ03 Yj07 MS23");
var mercMarshalledJacks = new ChildGroup(2, "MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16");
var mercMarshalledRhulicJacks = new ChildGroup(2, "MJ05 MJ06 MJ07 MJ08 MJ14 MJ15");

// CKP
var magnus = new ModelOption("p", "Magnus the Traitor", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eMagnus = new ModelOption("e", "Magnus the Warlord", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("MW01", "Magnus", "caster", "C", new Array(magnus, eMagnus), mercJacksMagnus));
addModel(new Model("Mw01", "Magnus the Traitor", "caster", "C", new Array(magnus), mercJacks));
addModel(new Model("Mx01", "Magnus the Warlord", "caster", "C", new Array(eMagnus), mercJacksWithCygnar));

// YK
addModel(new Model("MW02", "Gorten Grundback", "caster", "C", new Array(
		new ModelOption("p", "Gorten Grundback", null, 18, [{name:'points', value:-7}, {name:"casters", value:1}])
	), mercRhulicJacks));
// YKP
addModel(new Model("MW03", "Durgen Madhammer", "caster", "C", new Array(
		new ModelOption("p", "Durgen Madhammer", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), mercRhulicJacks));
// YP
addModel(new Model("MW04", "Ashlynn d'Elyse", "caster", "C", new Array(
		new ModelOption("p", "Ashlynn d'Elyse", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}])
	), mercJacks));
// CYK
addModel(new Model("MW05", "Fiona the Black", "caster", "C", new Array(
		new ModelOption("p", "Fiona the Black", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}])
	), mercJacks, null, "YU12 MS18 YW09 YJ17"));
// CYKP
addModel(new Model("MW06", "Captain Bartolo Montador", "caster", "C", new Array(
		new ModelOption("p", "Captain Bartolo Montador", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}])
	), mercJacks));
// *special
addModel(new Model("MW07", "Captain Phinneus Shae", "caster", "C", new Array(
		new ModelOption("p", "Captain Phinneus Shae", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
	), mercShaeJacks));
// CYKP
addModel(new Model("MW08", "Drake MacBain", "caster", "C", new Array(
		new ModelOption("p", "Drake MacBain", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
	), mercJacks));
// CYKP
addModel(new Model("MW09", "Captain Damiano", "caster", "C", new Array(
		new ModelOption("p", "Captain Damiano", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])                                         
	), mercJacks));
        
addModel(new Model("MW10", "General Ossrum", "caster", "C", new Array(
		new ModelOption("p", "General Ossrum", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])
	), mercRhulicJacks));
// Magnus	
addModel(new Model("MJ01", "Renegade", "lightjack", "2", new Array(new ModelOption("p", "Renegade", null, "xx..xxx....x.......LAAR.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("MJ02", "Talon", "lightjack", "U", new Array(new ModelOption("p", "Talon", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:4}])), null, true));
addModel(new Model("MJ03", "Vanguard", "lightjack", "U", new Array(new ModelOption("p", "Vanguard", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:5}])), null, true));
addModel(new Model("MJ04", "Buccaneer", "lightjack", "U", new Array(new ModelOption("p", "Buccaneer", null, "xxxxxxx....x.......L..R.LLMCRRxMMCCx", [{name:'points', value:3}])), null, true));
// Rhulic
addModel(new Model("MJ05", "Grundback Blaster", "lightjack", "U", new Array(new ModelOption("p", "Grundback Blaster", null, "xxxxxxxxxxxxxx..xxx....x.HHCM.HHCCMM", [{name:'points', value:3}])), null, true));
// Rhulic
addModel(new Model("MJ06", "Grundback Gunner", "lightjack", "U", new Array(new ModelOption("p", "Grundback Gunner", null, "xxxxxxxxxxxxxx..xxx....x.HHCM.HHCCMM", [{name:'points', value:3}])), null, true));
// Rhulic
addModel(new Model("MJ07", "Ghordson Driller", "heavyjack", "U", new Array(new ModelOption("p", "Ghordson Driller", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
// Rhulic
addModel(new Model("MJ08", "Wroughthammer Rockram", "heavyjack", "U", new Array(new ModelOption("p", "Wroughthammer Rockram", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));

addModel(new Model("MJ09", "Mangler", "heavyjack", "U", new Array(new ModelOption("p", "Mangler", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("MJ10", "Mule", "heavyjack", "U", new Array(new ModelOption("p", "Mule", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("MJ11", "Nomad", "heavyjack", "U", new Array(new ModelOption("p", "Nomad", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("MJ12", "Freebooter", "heavyjack", "U", new Array(new ModelOption("p", "Freebooter", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:6}])), null, true));
addModel(new Model("MJ13", "Mariner", "heavyjack", "U", new Array(new ModelOption("p", "Mariner", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));

//Rhulic
addModel(new Model("MJ14", "Ghordson Basher", "heavyjack", "U", new Array(new ModelOption("p", "Ghordson Basher", null, "xxxxxxx....x............HCCCCMHHHMMM", [{name:'points', value:7}])), null, true));
//Rhulic
addModel(new Model("MJ15", "Ghordson Avalancher", "heavyjack", "U", new Array(new ModelOption("p", "Ghordson Avalancher", null, "x....x.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));

addModel(new Model("MJ16", "Rover", "heavyjack", "U", new Array(new ModelOption("p", "Rover", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:8}])), null, true));
addModel(new Model("MJ17", "Rocinante", "heavyjack", "C", new Array(new ModelOption("p", "Rocinante", null, "xx..xx.............L..R.LLMCRRxMMCCx", [{name:'points', value:9}])), null, true));
addModel(new Model("MJ18", "Galleon", "heavyjack" , "2", new Array(new ModelOption("p","Galleon",null,new Array('Left',"xxxx..xxx............LCC.LLCCCLLMMMM",'Right',"..xxxx...xxx......CCR...CCCRR.MMMMRR"),[{name:'points', value:18}])), null, true));

// YKP
addModel(new Model("MS01", "Eiryss", "solo", "C", new Array(
		new ModelOption("p", "Eiryss, Mage Hunter of Ios", null, 5, [{name:'points', value:3}]),
		new ModelOption("e", "Eiryss, Angel of Retribution", null, 5, [{name:'points', value:3}])
	)));
//Eiryss for eKrueger Tier
addModel(new Model("Ms01", "Eiryss, Mage Hunter of Ios", "solo", "C", new Array(new ModelOption("p", "Eiryss, Mage Hunter of Ios", null, 5, [{name:'points', value:3}]))));
// YK
addModel(new Model("MS02", "Reinholdt, Gobber Speculator", "solo", "C", new Array(new ModelOption("p", "Reinholdt, Gobber Speculator", null, null, [{name:'points', value:1}]))));
// CYKP
addModel(new Model("MS03", "Gorman di Wulfe, Rogue Alchemist", "solo", "C", new Array(new ModelOption("p", "Gorman di Wulfe, Rogue Alchemist", null, 5, [{name:'points', value:2}]))));
// YP
addModel(new Model("MS04", "Rhupert Carvolo, Piper of Ord", "solo", "C", new Array(new ModelOption("p", "Rhupert Carvolo, Piper of Ord", null, 5, [{name:'points', value:2}]))));
// CYK
addModel(new Model("MS05", "Ogrun Bokur", "solo", "2", new Array(new ModelOption("p", "Ogrun Bokur", null, 8, [{name:'points', value:3}]))));
// KP
addModel(new Model("MS06", "Kell Bailoch", "solo", "C", new Array(new ModelOption("p", "Kell Bailoch", null, 5, [{name:'points', value:2}]))));
// CYKP 
addModel(new Model("MS07", "Bloody Bradigan", "solo", "C", new Array(new ModelOption("p", "Bloody Bradigan", null, 5, [{name:'points', value:2}]))));
// CYKP
addModel(new Model("MS08", "Bosun Grogspar", "solo", "C", new Array(new ModelOption("p", "Bosun Grogspar", null, 8, [{name:'points', value:2}]))));
// YKP
addModel(new Model("MS09", "Dirty Meg", "solo", "C", new Array(new ModelOption("p", "Dirty Meg", null, 5, [{name:'points', value:2}])), mercMarshalledJacks));
// CYKP
addModel(new Model("MS10", "Doc Killingsworth", "solo", "C", new Array(new ModelOption("p", "Doc Killingsworth", null, 5, [{name:'points', value:2}]))));
// CYKP
addModel(new Model("MS11", "First Mate Hawk", "solo", "C", new Array(new ModelOption("p", "First Mate Hawk", null, 5, [{name:'points', value:2}]))));
// CYKP
addModel(new Model("MS12", "Lord Rockbottom", "solo", "C", new Array(new ModelOption("p", "Lord Rockbottom", null, new Array("Rockbottom",5,"Coins","ooooo"), [{name:'points', value:2}]))));
// CYKP
addModel(new Model("MS13", "Master Gunner Dougal MacNaile", "solo", "C", new Array(new ModelOption("p", "Master Gunner Dougal MacNaile", null, 5, [{name:'points', value:2}])), null, null, null, "MU14"));
// YP
addModel(new Model("MS14", "Anastasia di Bray", "solo", "C", new Array(new ModelOption("p", "Anastasia di Bray", null, 5, [{name:'points', value:2}]))));
// CKP
addModel(new Model("MS15", "Orin Midwinter, Rogue Inquisitor", "solo", "C", new Array(new ModelOption("p", "Orin Midwinter, Rogue Inquisitor", null, 5, [{name:'points', value:2}]))));
// CYKP
addModel(new Model("MS16", "Stannis Brocker", "solo", "C", new Array(new ModelOption("m", "Stannis Brocker", null, 10, [{name:'points', value:4}]))));
// YK 6 15
addModel(new Model("MS17", "Thor Steinhammer", "solo", "C", new Array(new ModelOption("p", "Thor Steinhammer", null, 5, [{name:'points', value:2}])), mercMarshalledRhulicJacks));
// YK Animosity[Thalmar, undead] 
addModel(new Model("MS18", "Harlan Versh, Illuminated One", "solo", "C", new Array(new ModelOption("p", "Harlan Versh", null, 5, [{name:'points', value:2}])), null, null, "MW05 MU09 MS22 MS24"));
// YP Taryn di la Rovissi (02)
addModel(new Model("MS19", "Taryn di la Rovissi", "solo", "C", new Array(new ModelOption("p", "Taryn di la Rovissi", null, 5, [{name:'points', value:2}]))));
// YKP Rutgher shaw (09)
addModel(new Model("MS20", "Rutger Shaw", "solo", "C", new Array(new ModelOption("p", "Rutger Shaw", null, 5, [{name:'points', value:2}])), mercMarshalledJacks));
// CYKPR
addModel(new Model("MS21", "Madelyn Corbeau, Ordic Courtesan", "solo", "C", new Array(new ModelOption("p", "Madelyn Corbeau, Ordic Courtesan", null, 5, [{name:'points', value:2}]))));
// CYK
addModel(new Model("MS22", "Ragman", "solo", "C", new Array(new ModelOption("p", "Ragman", null, 5, [{name:'points', value:2}])), null, null, "YU12 MS18 YW09 YJ17"));
// YKR
addModel(new Model("MS23", "Sylys Wyshnalyrr, the Seeker", "solo", "C", new Array(new ModelOption("p", "Sylys Wyshnalyrr, the Seeker", null, 5, [{name:'points', value:2}])), null, true));
// YK
addModel(new Model("MS24", "Alexia, Mistress of the Witchfire", "solo", "C", new Array(new ModelOption("e", "Alexia, Mistress of the Witchfire", null, 10, [{name:'points', value:4}])), null, null, "MS18 MU09 YW09 YX09"));

// CYK
addModel(new Model("MU01", "Greygore Boomhowler & Co.", "unit", "C", new Array(
		new ModelOption("6", "Greygore Boomhowler & Co. (Boomhowler and 5 Grunts)", new Array(1, "Greygore Boomhowler", 5, "Greygore Boomhowler &amp; Grunt"), new Array("Boomhowler", 8), [{name:'points', value:6}]),
		new ModelOption("10", "Greygore Boomhowler & Co. (Boomhowler and 9 Grunts)", new Array(1, "Greygore Boomhowler", 9, "Greygore Boomhowler &amp; Grunt"), new Array("Boomhowler", 8), [{name:'points', value:9}])
	), new ChildGroup(1, "YA10 KA07")));
// YKP
addModel(new Model("MU02", "Herne & Jonne", "unit", "C", new Array(new ModelOption("2", "Herne & Jonne", new Array(1, "Herne", 1, "Jonne"), new Array("Herne",5,"Jonne",8), [{name:'points', value:3}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// YP
addModel(new Model("MU03", "Captain Sam MacHorne & the Devil Dogs", "unit", "C", new Array(
		new ModelOption("6", "Captain Sam MacHorne & the Devil Dogs (Sam and 5 Grunts)", new Array(1, "Captain Sam MacHorne", 5, "Devil Dog Grunt"), new Array("Sam", 5), [{name:'points', value:5}]),
		new ModelOption("10", "Captain Sam MacHorne & the Devil Dogs (Sam and 9 Grunts)", new Array(1, "Captain Sam MacHorne", 9, "Devil Dog Grunt"), new Array("Sam", 5), [{name:'points', value:7}])
	), new Array(new ChildGroup(1, "YA10 PA05"), mercMarshalledJacks)));
// CKP
addModel(new Model("MU04", "Croe's Cutthroats", "unit", "C", new Array(
		new ModelOption("6", "Croe's Cutthroats (Croe and 5 Grunts)", new Array(1, "Croe", 5, "Croe's Cutthroat Grunt"), new Array("Croe", 5), [{name:'points', value:7}]),
		new ModelOption("10", "Croe's Cutthroats (Croe and 9 Grunts)", new Array(1, "Croe", 9, "Croe's Cutthroat Grunt"), new Array("Croe", 5), [{name:'points', value:10}])
	), new ChildGroup(1, "KA07 PA05")));
// CYK
addModel(new Model("MU05", "Cylena Raefyll & Nyss Hunters", "unit", "C", new Array(
		new ModelOption("6", "Cylena Raefyll & Nyss Hunters (Cylena and 5 Grunts)", new Array(1, "Cylena Raefyll", 5, "Nyss Hunter Grunt"), new Array("Cylena", 5), [{name:'points', value:7}]),
		new ModelOption("10", "Cylena Raefyll & Nyss Hunters (Cylena and 9 Grunts)", new Array(1, "Cylena Raefyll", 9, "Nyss Hunter Grunt"), new Array("Cylena", 5), [{name:'points', value:10}])
	), new ChildGroup(1, "YA10 KA07"), null, "CU10 CS10"));
// YK
addModel(new Model("MU06", "Hammerfall High Shield Gun Corps", "unit", "2", new Array(
		new ModelOption("6", "Hammerfall High Shield Gun Corps (Leader and 5 Grunts)", new Array(1, "Hammerfall High Shield Gun Corp Leader", 5, "Hammerfall High Shield Gun Corp Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Hammerfall High Shield Gun Corps (Leader and 9 Grunts)", new Array(1, "Hammerfall High Shield Gun Corp Leader", 9, "Hammerfall High Shield Gun Corp Grunt"), null, [{name:'points', value:8}])
	), new Array(new ChildGroup(1, "YA10 KA07 MA03"), mercMarshalledRhulicJacks)));
// YP
addModel(new Model("MU07", "Horgenhold Forge Guard", "unit", "2", new Array(
		new ModelOption("6", "Horgenhold Forge Guard (Leader and 5 Grunts)", new Array(1, "Horgenhold Forge Guard Leader", 5, "Horgenhold Forge Guard Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Horgenhold Forge Guard (Leader and 9 Grunts)", new Array(1, "Horgenhold Forge Guard Leader", 9, "Horgenhold Forge Guard Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "YA10 PA05")));
// CYKP
addModel(new Model("MU08", "Steelhead Halberdiers", "unit", "3", new Array(
		new ModelOption("6", "Steelhead Halberdiers (Leader and 5 Grunts)", new Array(1, "Steelhead Halberdier Leader", 5, "Steelhead Halberdier Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Steelhead Halberdiers (Leader and 9 Grunts)", new Array(1, "Steelhead Halberdier Leader", 9, "Steelhead Halberdier Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// YK
addModel(new Model("MU09", "Alexia Ciannor & the Risen", "unit", "C", new Array(new ModelOption("10", "Alexia Ciannor & the Risen (Alexia and 9 Risen Grunts)", new Array(1, "Alexia Ciannor", 9, "Risen Grunt", 0, "Risen Thrall"), new Array("Alexia", 5), [{name:'points', value:5}])
	), new ChildGroup(1, "YA10 KA07"), null, "MS18 MS24 YW09 YX09"));
// Shae 
addModel(new Model("MU10", "Commodore Cannon & Crew", "unit", "C", new Array(new ModelOption("4", "Commodore Cannon & Crew (Commodore and 3 Crewmen)", new Array(1, "Commodore Cannon", 3, " Commodore Cannon Crewmen"), new Array("Commodore", 10), [{name:'points', value:4}])),null,true));
// YKP
addModel(new Model("MU11", "Lady Aiyana & Master Holt", "unit", "C", new Array(new ModelOption("2", "Lady Aiyana & Master Holt", new Array(1, "Lady Aiyana", 1, "Master Holt"), new Array("Aiyanna",5,"Holt",5), [{name:'points', value:4}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// CYKP
addModel(new Model("MU12", "Press Gangers", "unit", "2", new Array(
		new ModelOption("6", "Press Gangers (Leader and 5 Grunts)", new Array(1, "Press Ganger Leader", 5, "Press Ganger Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Press Gangers (Leader and 9 Grunts)", new Array(1, "Press Ganger Leader", 9, "Press Ganger Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// CYKP
addModel(new Model("MU13", "Sea Dog Crew", "unit", "U", new Array(
		new ModelOption("6", "Sea Dog Crew (Leader and 5 Grunts)", new Array(1, "Sea Dog Crew Leader", 5, "Sea Dog Crew Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Sea Dog Crew (Leader and 9 Grunts)", new Array(1, "Sea Dog Crew Leader", 9, "Sea Dog Crew Grunt"), null, [{name:'points', value:8}])
	), new Array(new ChildGroup(1, "YA10 KA07 PA05 MA01"), new ChildGroup(1, "MA02"))));
// CYKP
addModel(new Model("MA01", "Mr. Walls, Sea Dog Crew Quartermaster", "ua", "C", new Array(new ModelOption("p", "Mr. Walls Sea Dog Crew Quartermaster", null, new Array("Mr Walls", 5), [{name:'points', value:2}])), null, true));
// CYKP
addModel(new Model("MA02", "Sea Dog Crew Riflemen", "ua", "U", new Array(
		new ModelOption("1", "1 Sea Dog Crew Rifleman", new Array(1, "Sea Dog Crew Rifleman"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Sea Dog Crew Riflemen", new Array(2, "Sea Dog Crew Rifleman"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Sea Dog Crew Riflemen", new Array(3, "Sea Dog Crew Rifleman"), null, [{name:'points', value:3}])
	), null, true));	
// CYKP
addModel(new Model("MU14", "Sea Dog Deck Gun", "unit", "2", new Array(new ModelOption("2", "Sea Dog Deck Gun", new Array(1, "Sea Dog Deck Gun Gunner", 1, "Sea Dog Deck Gun Crew"), null, [{name:'points', value:2}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// CYKP
addModel(new Model("MU15", "Steelhead Heavy Cavalry", "unit", "1", new Array(
		new ModelOption("3", "Steelhead Heavy Cavalry (Leader and 2 Grunts)", new Array(1, "Steelhead Heavy Cavalry Leader", 2, "Steelhead Heavy Cavalry Grunt"), new Array("Horseman A",5,"Horseman B",5,"Horseman C",5), [{name:'points', value:6}]),
		new ModelOption("5", "Steelhead Heavy Cavalry (Leader and 4 Grunts)", new Array(1, "Steelhead Heavy Cavalry Leader", 4, "Steelhead Heavy Cavalry Grunt"), new Array("Horseman A",5,"Horseman B",5,"Horseman C",5,"Horseman D",5,"Horseman E",5), [{name:'points', value:10}])
	)));
// YKP
addModel(new Model("MU16", "Dannon Blythe & Bull", "unit", "C", new Array(new ModelOption("2", "Dannon Blythe & Bull", new Array(1, "Dannon Blythe", 1, "Bull"), new Array("Blythe",5,"Bull",8), [{name:'points', value:4}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
// YP
addModel(new Model("MU17", "Horgenhold Artillery Corps", "unit", "2", new Array(new ModelOption("3", "Horgenhold Artillery Corps (Leader and 2 Grunts)", new Array(1, "Horgenhold Artillery Corps Leader", 2, "Horgenhold Artillery Corps Grunt"), null, [{name:'points', value:3}])
	), new ChildGroup(1, "YA10 PA05")));
// YK
addModel(new Model("MA03", "Hammerfall High Shield Gun Corps Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Hammerfall High Shield Gun Corps Officer & Standard", new Array(1, "Hammerfall High Shield Gun Corps Officer", 1, "Hammerfall High Shield Gun Corps Standard"), new Array("Officer", 5), [{name:'points', value:3}])), null, true));
//CYKP
addModel(new Model("MU18", "Steelhead Riflemen", "unit", "3", new Array(
		new ModelOption("6", "Steelhead Riflemen (Leader and 5 Grunts)", new Array(1, "Steelhead Rifleman Leader", 5, "Steelhead Rifleman Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Steelhead Riflemen (Leader and 9 Grunts)", new Array(1, "Steelhead Rifleman Leader", 9, "Steelhead Rifleman Grunt"), null, [{name:'points', value:9}])
	), new ChildGroup(1, "YA10 KA07 PA05")));
//YP
addModel(new Model("MU19", "Ogrun Assault Corps", "unit", "2", new Array(
		new ModelOption("3", "Ogrun Assault Corps (Leader and 2 Grunts)", new Array(1, "Ogrun Assault Corps Leader", 2, "Ogrun Assault Corps Grunt"), new Array("Model A",8,"Model B",8,"Model C",8), [{name:'points', value:6}]),
		new ModelOption("5", "Ogrun Assault Corps (Leader and 4 Grunts)", new Array(1, "Ogrun Assault Corps Leader", 4, "Ogrun Assault Corps Grunt"), new Array("Model A",8,"Model B",8,"Model C",8,"Model D",8,"Model E",8), [{name:'points', value:9}])
	), new ChildGroup(1, "YA10 PA05")));
var circleColors = new Array("#7D8748","#000000");
var circleFaction = new Faction("Circle Orboros", "O", circleColors);
factions.push(circleFaction);

var circleBeasts = new ChildGroup(99, "OB01 OB02 OB03 OB04 OB05 OB06 OB07 OB08 OB09 OB10 OB11 OB12 OB13 OB14 OB15");

var kaya = new ModelOption("p", "Kaya the Wildborne", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eKaya = new ModelOption("e", "Kaya the Moonhunter & Laris", new Array(1, "Kaya the Moonhunter", 1, "Laris"), new Array("Kaya the Moonhunter", 16, "Laris", new Array(6,6,8)), [{name:'points', value:-3}, {name:"casters", value:1}]);
addModel(new Model("OW01", "Kaya", "caster", "C", new Array(kaya, eKaya), circleBeasts));
addModel(new Model("Ow01", "Kaya the Wildborne", "caster", "C", new Array(kaya), circleBeasts));
addModel(new Model("Ox01", "Kaya the Moonhunter & Laris", "caster", "C", new Array(eKaya), circleBeasts));

var krueger = new ModelOption("p", "Krueger the Stormwrath", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eKrueger = new ModelOption("e", "Krueger the Stormlord", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("OW02", "Krueger", "caster", "C", new Array(krueger, eKrueger), circleBeasts));
addModel(new Model("Ow02", "Krueger the Stormwrath", "caster", "C", new Array(krueger), circleBeasts));
addModel(new Model("Ox02", "Krueger the Stormlord", "caster", "C", new Array(eKrueger), circleBeasts));

var baldur = new ModelOption("p", "Baldur the Stonecleaver", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eBaldur = new ModelOption("e", "Baldur the Stonesoul", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("OW03", "Baldur", "caster", "C", new Array(baldur, eBaldur), circleBeasts));
addModel(new Model("Ow03", "Baldur the Stonecleaver", "caster", "C", new Array(baldur), circleBeasts));
addModel(new Model("Ox03", "Baldur the Stonesoul", "caster", "C", new Array(eBaldur), circleBeasts));

addModel(new Model("OW03", "Baldur", "caster", "C", new Array(
		new ModelOption("p", "Baldur the Stonecleaver", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OW04", "Morvahna", "caster", "C", new Array(
		new ModelOption("p", "Morvahna the Autumnblade", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OW05", "Kromac", "caster", "C", new Array(
		new ModelOption("p", "Kromac the Ravenous", new Array(1, "Kromac the Ravenous (human)", 1, "Kromac the Ravenous (beast)"), 17, [{name:'points', value:-4}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OW06", "Mohsar", "caster", "C", new Array(
		new ModelOption("p", "Mohsar the Desertwalker", null, 15, [{name:'points', value:-5}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OW07", "Cassius", "caster", "C", new Array(
		new ModelOption("p", "Cassius the Oathkeeper", null, 20, [{name:'points', value:-6}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OW08", "Grayle", "caster", "C", new Array(
		new ModelOption("p", "Grayle the Farstrider", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
), circleBeasts));

addModel(new Model("OB01", "Argus", "lightbeast", "U", new Array(new ModelOption("p", "Argus", null, new Array(7,7,7), [{name:'points', value:4}])), null, true));
addModel(new Model("OB02", "Gorax", "lightbeast", "U", new Array(new ModelOption("p", "Gorax", null, new Array(7,8,7), [{name:'points', value:4}])), null, true));
addModel(new Model("OB03", "Woldwatcher", "lightbeast", "U", new Array(new ModelOption("p", "Woldwatcher", null, new Array(7,8,9), [{name:'points', value:5}])), null, true));
addModel(new Model("OB04", "Woldwyrd", "lightbeast", "U", new Array(new ModelOption("p", "Woldwyrd", null, new Array(8,6,8), [{name:'points', value:5}])), null, true));

addModel(new Model("OB05", "Gnarlhorn Satyr", "heavybeast", "U", new Array(new ModelOption("p", "Gnarlhorn Satyr", null, new Array(8,10,8), [{name:'points', value:8}])), null, true));
addModel(new Model("OB06", "Megalith", "heavybeast", "C", new Array(new ModelOption("p", "Megalith", null, new Array(10,14,11), [{name:'points', value:11}])), null, true));
addModel(new Model("OB07", "Pureblood Warpwolf", "heavybeast", "U", new Array(new ModelOption("p", "Pureblood Warpwolf", null, new Array(8,8,10), [{name:'points', value:9}])), null, true));
addModel(new Model("OB08", "Shadowhorn Satyr", "heavybeast", "U", new Array(new ModelOption("p", "Shadowhorn Satyr", null, new Array(7,10,7), [{name:'points', value:7}])), null, true));
addModel(new Model("OB09", "Feral Warpwolf", "heavybeast", "U", new Array(new ModelOption("p", "Feral Warpwolf", null, new Array(8,11,9), [{name:'points', value:9}])), null, true));
addModel(new Model("OB10", "Woldwarden", "heavybeast", "U", new Array(new ModelOption("p", "Woldwarden", null, new Array(10,14,11), [{name:'points', value:9}])), null, true));
addModel(new Model("OB11", "Warpwolf Stalker", "heavybeast", "U", new Array(new ModelOption("p", "Warpwolf Stalker", null, new Array(8,9,8), [{name:'points', value:10}])), null, true));
addModel(new Model("OB12", "Woldguardian", "heavybeast", "U", new Array(new ModelOption("p", "Woldguardian", null, new Array(8,14,8), [{name:'points', value:9}])), null, true));

addModel(new Model("OB13", "Scarsfell Griffon", "lightbeast", "U", new Array(new ModelOption("p", "Scarsfell Griffon", null, new Array(8,7,7), [{name:'points', value:5}])), null, true));
addModel(new Model("OB14", "Ghetorix", "heavybeast", "C", new Array(new ModelOption("p", "Ghetorix", null, new Array(7,12,9), [{name:'points', value:11}])), null, true));
addModel(new Model("OB15", "Winter Argus", "lightbeast", "U", new Array(new ModelOption("p", "Winter Argus", null, new Array(7,7,7), [{name:'points', value:5}])), null, true));

addModel(new Model("OE01", "Celestal Fulcrum", "battleengine", "2", new Array(new ModelOption("p", "Celestal Fulcrum", null, 20, [{name:'points', value:9}]))));

addModel(new Model("OU01", "Druids of Orboros", "unit", "2", new Array(
		new ModelOption("6", "Druids of Orboros (Leader and 5 Grunts)", new Array(1, "Druid of Orboros Leader", 5, "Druid of Orboros Grunt"), null, [{name:'points', value:7}])
	), new ChildGroup(1, "OA01")));
addModel(new Model("OA01", "Druids of Orboros Overseer", "ua", "1", new Array(new ModelOption("p", "Druid of Orboros Overseer", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("OU02", "Stoneward and Woldstalkers", "unit", "2", new Array(
		new ModelOption("6", "Stoneward and 5 Woldstalkers", new Array(1, "Stoneward", 5, "Stoneward Woldstalkers"), null, [{name:'points', value:5}])
	)));
addModel(new Model("OU03", "Tharn Ravagers", "unit", "2", new Array(
		new ModelOption("4", "Tharn Ravagers (Leader and 3 Grunts)", new Array(1, "Tharn Ravager Leader", 3, "Tharn Ravager Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8), [{name:'points', value:6}]),
		new ModelOption("6", "Tharn Ravagers (Leader and 5 Grunts)", new Array(1, "Tharn Ravager Leader", 5, "Tharn Ravager Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8, "Model f", 8), [{name:'points', value:9}])
	), new Array(new ChildGroup(1, "OA02"), new ChildGroup(1, "OA06"))));
addModel(new Model("OA02", "Tharn Ravager Shaman", "ua", "1", new Array(new ModelOption("p", "Tharn Ravager Shaman", null, 8, [{name:'points', value:2}])), null, true));
addModel(new Model("OA06", "Tharn Ravager Chieftain", "ua", "1", new Array(new ModelOption("p", "Tharn Ravager Chieftain", null, 8, [{name:'points', value:2}])), null, true));
addModel(new Model("OU04", "Reeves of Orboros", "unit", "2", new Array(
		new ModelOption("6", "Reeves of Orboros (Leader and 5 Grunts)", new Array(1, "Reeve of Orboros Leader", 5, "Reeve of Orboros Grunt"), null, [{name:'points', value:6}]),
		new ModelOption("10", "Reeves of Orboros (Leader and 9 Grunts)", new Array(1, "Reeve of Orboros Leader", 9, "Reeve of Orboros Grunt"), null, [{name:'points', value:10}])
	), new ChildGroup(1, "OA05")));
addModel(new Model("OA05", "Reeves of Orboros Chieftain & Standard", "ua", "1", new Array(new ModelOption("2", "Reeves of Orboros Chieftain & Standard", new Array(1, "Reeves of Orboros Chieftain", 1, "Reeves of Orboros Standard"), new Array("Chieftain", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("OU05", "Tharn Bloodweavers", "unit", "2", new Array(
		new ModelOption("6", "Tharn Bloodweavers (Leader and 5 Grunts)", new Array(1, "Tharn Bloodweaver Leader", 5, "Tharn Bloodweaver Grunt"), null, [{name:'points', value:5}])
	)));
addModel(new Model("OU06", "Tharn Wolfriders", "unit", "1", new Array(
		new ModelOption("3", "Tharn Wolfriders (Leader and 2 Grunts)", new Array(1, "Tharn Wolfrider Leader", 2, "Tharn Wolfrider Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:6}]),
		new ModelOption("5", "Tharn Wolfriders (Leader and 4 Grunts)", new Array(1, "Tharn Wolfrider Leader", 4, "Tharn Wolfrider Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5, "Model d", 5, "Model e", 5), [{name:'points', value:10}])
	)));
addModel(new Model("OU07", "Tharn Bloodtrackers", "unit", "1", new Array(
		new ModelOption("6", "Tharn Bloodtrackers (Leader and 5 Grunts)", new Array(1, "Tharn Bloodtracker Leader", 5, "Tharn Bloodtracker Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Tharn Bloodtrackers (Leader and 9 Grunts)", new Array(1, "Tharn Bloodtracker Leader", 9, "Tharn Bloodtracker Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "OA07")));
addModel(new Model("OA07", "Nuala the Huntress", "ua", "C", new Array(new ModelOption("p", "Nuala the Huntress", null, 5, [{name:'points', value:2}])), null, true));
 
addModel(new Model("OU08", "Wolves of Orboros", "unit", "3", new Array(
		new ModelOption("6", "Wolves of Orboros (Leader and 5 Grunts)", new Array(1, "Wolf of Orboros Leader", 5, "Wolf of Orboros Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Wolves of Orboros (Leader and 9 Grunts)", new Array(1, "Wolf of Orboros Leader", 9, "Wolf of Orboros Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "OA03")));
addModel(new Model("OA03", "Wolf of Orboros Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Wolf of Orboros Officer & Standard", new Array(1, "Wolf of Orboros Officer", 1, "Wolf of Orboros Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("OU09", "Shifting Stones", "unit", "2", new Array(
		new ModelOption("3", "Shifting Stones", new Array(3, "Shifting Stone"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:2}])
	), new ChildGroup(1, "OA04")));
addModel(new Model("OA04", "Stone keeper", "ua", "1", new Array(new ModelOption("p", "Stone keeper", null, 5, [{name:'points', value:1}])), null, true));
addModel(new Model("OU10", "Sentry Stone & Manikins", "unit", "2", new Array(
		new ModelOption("4", "Sentry Stone (Leader and 3 Manikins)", new Array(1, "Sentry Stone", 3, "Sentry Stone Manikin"), 8, [{name:'points', value:3}])
	)));
addModel(new Model("OU11", "Warpborn Skinwalkers", "unit", "2", new Array(
		new ModelOption("3", "Warpborn Skinwalkers (Leader and 2 Grunts)", new Array(1, "Skinwalker Leader", 2, "Skinwalker Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8), [{name:'points', value:5}]),
		new ModelOption("5", "Warpborn Skinwalkers (Leader and 4 Grunts)", new Array(1, "Skinwalker Leader", 4, "Skinwalker Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8), [{name:'points', value:8}])
	)));

addModel(new Model("OS01", "Blackclad Wayfarer", "solo", "2", new Array(new ModelOption("p", "Blackclad Wayfarer", null, 5, [{name:'points', value:2}]))));
addModel(new Model("OS02", "Lord of the Feast", "solo", "C", new Array(new ModelOption("p", "Lord of the Feast", null, 8, [{name:'points', value:4}]))));
addModel(new Model("OS03", "Tharn Ravager White Mane", "solo", "2", new Array(new ModelOption("p", "Tharn Ravager White Mane", null, 8, [{name:'points', value:3}]))));
addModel(new Model("OS04", "Wolflord Morraig", "solo", "C", new Array(new ModelOption("m", "Wolflord Morraig", null, new Array("Wolflord Morraig (mounted)", 10, "Wolflord Morraig (dismounted)", 5), [{name:'points', value:5}]))));
addModel(new Model("OS05", "War Wolf", "solo", "3", new Array(new ModelOption("p", "War Wolf", null, 5, [{name:'points', value:1}]))));
addModel(new Model("OS06", "Druid Wilder", "solo", "1", new Array(new ModelOption("p", "Druid Wilder", null, 5, [{name:'points', value:2}]))));
addModel(new Model("OS07", "Reeve Hunter", "solo", "2", new Array(new ModelOption("p", "Reeve Hunter", null, 5, [{name:'points', value:2}]))));
addModel(new Model("OS08", "Gallows Grove", "solo", "4", new Array(new ModelOption("p", "Gallows Grove", null, 5, [{name:'points', value:1}]))));
var everblightColors = new Array("#FFFFFF","#9167B3");
var everblightFaction = new Faction("Legion of Everblight", "E", everblightColors);
factions.push(everblightFaction);

var everblightBeasts = new ChildGroup(99, "EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB10 EB11 EB12 EB13 EB14 EB15 EB16");

var lylyth = new ModelOption("p", "Lylyth, Herald of Everblight", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eLylyth = new ModelOption("e", "Lylyth, Shadow of Everblight", null, 15, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("EW01", "Lylyth", "caster", "C", new Array(lylyth, eLylyth), everblightBeasts));
addModel(new Model("Ew01", "Lylyth, Herald of Everblight", "caster", "C", new Array(lylyth), everblightBeasts));
addModel(new Model("Ex01", "Lylyth, Shadow of Everblight", "caster", "C", new Array(eLylyth), everblightBeasts));

var thagrosh = new ModelOption("p", "Thagrosh, Prophet of Everblight", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eThagrosh = new ModelOption("e", "Thagrosh, the Messiah", null, 20, [{name:'points', value:-3}, {name:"casters", value:1}]);
addModel(new Model("EW02", "Thagrosh", "caster", "C", new Array(thagrosh, eThagrosh), everblightBeasts));
addModel(new Model("Ew02", "Thagrosh, Prophet of Everblight", "caster", "C", new Array(thagrosh), everblightBeasts));
addModel(new Model("Ex02", "Thagrosh, the Messiah", "caster", "C", new Array(eThagrosh), everblightBeasts));

var vayl = new ModelOption("p", "Vayl, Disciple of Everblight", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eVayl = new ModelOption("e", "Vayl, Consul of Everblight", null, 14, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("EW03", "Vayl", "caster", "C", new Array(vayl, eVayl), everblightBeasts));
addModel(new Model("Ew03", "Vayl, Disciple of Everblight", "caster", "C", new Array(vayl), everblightBeasts));
addModel(new Model("Ex03", "Vayl, Consul of Everblight", "caster", "C", new Array(eVayl), everblightBeasts));

addModel(new Model("EW04", "Rhyas", "caster", "C", new Array(
		new ModelOption("p", "Rhyas, Sigil of Everblight", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
), everblightBeasts));

addModel(new Model("EW05", "Saeryn", "caster", "C", new Array(
		new ModelOption("p", "Saeryn, Omen of Everblight", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}])
), everblightBeasts));

addModel(new Model("EW06", "Absylonia", "caster", "C", new Array(
		new ModelOption("p", "Absylonia, Terror of Everblight", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}])
), everblightBeasts));

addModel(new Model("EW07", "Bethayne", "caster", "C", new Array(
		new ModelOption("e", "Bethayne & Belphagor", new Array(1, "Bethayne, Voice of Everblight", 1, "Belphagor"), new Array("Bethayne, Voice of Everblight", 14, "Belphagor", new Array(6,12,6)), [{name:'points', value:-3}, {name:"casters", value:1}])
), everblightBeasts));

addModel(new Model("EW08", "Kallus", "caster", "C", new Array(
		new ModelOption("p", "Kallus, Wrath of Everblight", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])
), everblightBeasts));

addModel(new Model("EB01", "Harrier", "lesserbeast", "U", new Array(new ModelOption("p", "Harrier", null, new Array(4,4,5), [{name:'points', value:2}])), null, true));
addModel(new Model("EB02", "Shredder", "lesserbeast", "U", new Array(new ModelOption("p", "Shredder", null, new Array(4,4,5), [{name:'points', value:2}])), null, true));

addModel(new Model("EB03", "Nephilim Protector", "lightbeast", "U", new Array(new ModelOption("p", "Nephilim Protector", null, new Array(8,7,7), [{name:'points', value:5}])), null, true));
addModel(new Model("EB04", "Nephilim Soldier", "lightbeast", "U", new Array(new ModelOption("p", "Nephilim Soldier", null, new Array(8,7,7), [{name:'points', value:5}])), null, true));
addModel(new Model("EB05", "Raek", "lightbeast", "U", new Array(new ModelOption("p", "Raek", null, new Array(6,7,7), [{name:'points', value:4}])), null, true));
addModel(new Model("EB06", "Teraph", "lightbeast", "U", new Array(new ModelOption("p", "Teraph", null, new Array(6,7,7), [{name:'points', value:5}])), null, true));

addModel(new Model("EB07", "Seraph", "heavybeast", "U", new Array(new ModelOption("p", "Seraph", null, new Array(8,9,8), [{name:'points', value:8}])), null, true));
addModel(new Model("EB08", "Angelius", "heavybeast", "U", new Array(new ModelOption("p", "Angelius", null, new Array(8,9,8), [{name:'points', value:9}])), null, true));
addModel(new Model("EB09", "Carnivean", "heavybeast", "U", new Array(new ModelOption("p", "Carnivean", null, new Array(8,12,10), [{name:'points', value:11}])), null, true));
addModel(new Model("EB10", "Typhon", "heavybeast", "C", new Array(new ModelOption("p", "Typhon", null, new Array(10,10,10), [{name:'points', value:12}])), null, true));
addModel(new Model("EB11", "Scythean", "heavybeast", "U", new Array(new ModelOption("p", "Scythean", null, new Array(8,12,10), [{name:'points', value:9}])), null, true));
 
addModel(new Model("EB12", "Stinger", "lesserbeast", "U", new Array(new ModelOption("p", "Stinger", null, new Array(4,4,5), [{name:'points', value:2}])), null, true));
addModel(new Model("EB13", "Ravagore", "heavybeast", "U", new Array(new ModelOption("p", "Ravagore", null, new Array(8,12,10), [{name:'points', value:10}])), null, true));
addModel(new Model("EB14", "Nephilim Bolt Thrower", "lightbeast", "U", new Array(new ModelOption("p", "Nephilim Bolt Thrower", null, new Array(8,7,7), [{name:'points', value:6}])), null, true));

addModel(new Model("EB15", "Proteus", "heavybeast", "C", new Array(new ModelOption("p", "Proteus", null, new Array(8,12,10), [{name:'points', value:11}])), null, true));
addModel(new Model("EB16", "Naga Nightlurker", "lightbeast", "U", new Array(new ModelOption("p", "Naga Nightlurker", null, new Array(7,5,7), [{name:'points', value:5}])), null, true));

addModel(new Model("EE01", "Throne of Everblight", "battleengine", "2", new Array(new ModelOption("p", "Throne of Everblight", null, 24, [{name:'points', value:9}]))));
 
addModel(new Model("EU01", "Blighted Nyss Archers", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Archers (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Archer Leader", 5, "Blighted Nyss Archer Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Blighted Nyss Archers (Leader and 9 Grunts)", new Array(1, "Blighted Nyss Archer Leader", 9, "Blighted Nyss Archer Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "EA01")));
addModel(new Model("EA01", "Blighted Nyss Archer Officer & Ammo Porter", "ua", "1", new Array(new ModelOption("2", "Blighted Nyss Archers Officer & Standard", new Array(1, "Blighted Nyss Archer Officer", 1, "Blighted Nyss Archer Ammo Porter"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("EU02", "Blighted Nyss Legionnaires", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Legionnaires (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Legionnaire Leader", 5, "Blighted Nyss Legionnaire Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Blighted Nyss Legionnaires (Leader and 9 Grunts)", new Array(1, "Blighted Nyss Legionnaire Leader", 9, "Blighted Nyss Legionnaire Grunt"), null, [{name:'points', value:6}])
), new ChildGroup(1, "EA05")));
addModel(new Model("EA05", "Captain Farilor & Standard", "ua", "C", new Array(new ModelOption("2", "Captain Farilor & Standard", new Array(1, "Captain Farilor", 1, "Blighted Nyss Standard"), new Array("Farilor", 5,"Standard", 5), [{name:'points', value:3}])), null, true));
addModel(new Model("EU03", "Blighted Nyss Swordsmen", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Swordsmen (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Swordsman Leader", 5, "Blighted Nyss Swordsman Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Blighted Nyss Swordsmen (Leader and 9 Grunts)", new Array(1, "Blighted Nyss Swordsman Leader", 9, "Blighted Nyss Swordsman Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "EA02")));
addModel(new Model("EA02", "Blighted Nyss Swordsmen Abbot & Champion", "ua", "1", new Array(new ModelOption("2", "Blighted Nyss Swordsmen Abbot & Champion", new Array(1, "Blighted Nyss Swordsman Abbot", 1, "Blighted Nyss Swordsman Champion"), new Array("Abbot", 5,"Champion", 5), [{name:'points', value:3}])), null, true));
addModel(new Model("EU04", "Blighted Nyss Raptors", "unit", "1", new Array(
		new ModelOption("3", "Blighted Nyss Raptors (Leader and 2 Grunts)", new Array(1, "Blighted Nyss Raptor Leader", 2, "Blighted Nyss Raptor Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:6}]),
		new ModelOption("5", "Blighted Nyss Raptors (Leader and 4 Grunts)", new Array(1, "Blighted Nyss Raptor Leader", 4, "Blighted Nyss Raptor Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5, "Model d", 5, "Model e", 5), [{name:'points', value:10}])
	)));
addModel(new Model("EU05", "Blighted Nyss Scather Crew", "unit", "2", new Array(
		new ModelOption("3", "Blighted Nyss Scather Crew (Leader and 2 Grunts)", new Array(1, "Blighted Nyss Scather Crew Leader", 2, "Blighted Nyss Scather Crew Grunt"), null, [{name:'points', value:3}])
	))); 
  
addModel(new Model("EU06", "Spawning Vessel", "unit", "1", new Array(
		new ModelOption("4", "Spawning Vessel (Leader and 3 Grunts)", new Array(1, "Spawning Vessel", 1, "Spawning Vessel Leader", 3, "Spawning Vessel Grunt"), 10, [{name:'points', value:2}]),
		new ModelOption("6", "Spawning Vessel (Leader and 5 Grunts)", new Array(1, "Spawning Vessel", 1, "Spawning Vessel Leader", 5, "Spawning Vessel Grunt"), 10, [{name:'points', value:3}])
	)));
addModel(new Model("EU07", "Blighted Nyss Striders", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Striders (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Strider Leader", 5, "Blighted Nyss Strider Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "EA03")));
addModel(new Model("EA03", "Blighted Nyss Striders Officer & Musician", "ua", "1", new Array(new ModelOption("2", "Blighted Nyss Striders Officer & Musician", new Array(1, "Blighted Nyss Strider Officer", 1, "Blighted Nyss Strider Musician"), new Array("Officer", 5), [{name:'points', value:3}])), null, true));
addModel(new Model("EU08", "Blighted Ogrun Warmongers", "unit", "3", new Array(
		new ModelOption("3", "Blighted Ogrun Warmongers (Leader and 2 Grunts)", new Array(1, "Blighted Ogrun Warmonger Leader", 2, "Blighted Ogrun Warmonger Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8), [{name:'points', value:5}]),
		new ModelOption("5", "Blighted Ogrun Warmongers (Leader and 4 Grunts)", new Array(1, "Blighted Ogrun Warmonger Leader", 4, "Blighted Ogrun Warmonger Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8), [{name:'points', value:8}])
	)));
addModel(new Model("EU09", "Blighted Ogrun Warspears", "unit", "3", new Array(
		new ModelOption("3", "Blighted Ogrun Warspears (Leader and 2 Grunts)", new Array(1, "Blighted Ogrun Warspear Leader", 2, "Blighted Ogrun Warspear Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8), [{name:'points', value:5}]),
		new ModelOption("5", "Blighted Ogrun Warspears (Leader and 4 Grunts)", new Array(1, "Blighted Ogrun Warspear Leader", 4, "Blighted Ogrun Warspear Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8), [{name:'points', value:8}])
	)));
addModel(new Model("EU10", "Blighted Nyss Grotesques", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Grotesques (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Grotesque Leader", 5, "Blighted Nyss Grotesque Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Blighted Nyss Grotesques (Leader and 9 Grunts)", new Array(1, "Blighted Nyss Grotesque Leader", 9, "Blighted Nyss Grotesque Grunt"), null, [{name:'points', value:6}])
	)));
addModel(new Model("EU11", "Blighted Nyss Hex Hunters", "unit", "2", new Array(
		new ModelOption("6", "Blighted Nyss Hex Hunters (Leader and 5 Grunts)", new Array(1, "Blighted Nyss Hex Hunter Leader", 5, "Blighted Nyss Hex Hunter Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Blighted Nyss Hex Hunters (Leader and 9 Grunts)", new Array(1, "Blighted Nyss Hex Hunter Leader", 9, "Blighted Nyss Hex Hunter Grunt"), null, [{name:'points', value:8}])
	), new ChildGroup(1, "EA04")));
addModel(new Model("EA04", "Bayal, Hound of Everblight", "ua", "C", new Array(new ModelOption("1", "Bayal, Hound of Everblight", null, 5, [{name:'points', value:3}])), null, true));
addModel(new Model("EU12", "Blackfrost Shard", "unit", "C", new Array(new ModelOption("3", "Blackfrost Shard", new Array(1, "Blackfrost Sevryn", 1, "Blackfrost Rhylyss", 1, "Blackfrost Vysarr"), new Array("Sevryn", 5, "Rhylyss", 5, "Vysarr", 5), [{name:'points', value:5}]))));

addModel(new Model("ES01", "Blighted Nyss Sorceress and Hellion", "solo", "2", new Array(new ModelOption("m", "Blighted Nyss Sorceress and Hellion", null, 10, [{name:'points', value:4}]))));
addModel(new Model("ES02", "Incubus", "solo", "2", new Array(new ModelOption("5", "Incubus", new Array(5, "Incubus"), null, [{name:'points', value:5}]))));
addModel(new Model("ES03", "Blighted Nyss Shepherd", "solo", "2", new Array(new ModelOption("p", "Blighted Nyss Shepherd", null, null, [{name:'points', value:1}]))));
addModel(new Model("ES04", "Strider Deathstalker", "solo", "2", new Array(new ModelOption("p", "Strider Deathstalker", null, 5, [{name:'points', value:2}]))));
addModel(new Model("ES05", "The Forsaken", "solo", "2", new Array(new ModelOption("p", "The Forsaken", null, 5, [{name:'points', value:2}]))));
addModel(new Model("ES06", "Warmonger War Chief", "solo", "2", new Array(new ModelOption("p", "Warmonger War Chief", null, 8, [{name:'points', value:3}]))));
addModel(new Model("ES07", "Spell Martyr", "solo", "1", new Array(
		new ModelOption("1", "1 Spell Martyr", new Array(1, "Spell Martyr"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Spell Martyrs", new Array(2, "Spell Martyr"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Spell Martyrs", new Array(3, "Spell Martyr"), null, [{name:'points', value:3}])
	)));	
addModel(new Model("ES08", "Annyssa Ryvaal, Talon of Everblight", "solo", "C", new Array(new ModelOption("m", "Annyssa Ryvaal, Talon of Everblight", null, 8, [{name:'points', value:4}]))));
addModel(new Model("ES09", "Succubus", "solo", "1", new Array(new ModelOption("p", "Succubus", null, 5, [{name:'points', value:2}]))));var trollbloodColors = new Array("#000000","#1A7BC8");
var trollbloodFaction = new Faction("Trollbloods", "T", trollbloodColors);
factions.push(trollbloodFaction);

var trollbloodBeasts = new ChildGroup(99, "TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB10 TB11 TB12 TB13 TB14 TS06");

var madrak = new ModelOption("p", "Chief Madrak Ironhide ", null, 18, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eMadrak = new ModelOption("e", "Madrak Ironhide, World Ender", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("TW01", "Madrak Ironhide", "caster", "C", new Array(madrak, eMadrak), trollbloodBeasts));
addModel(new Model("Tw01", "Chief Madrak Ironhide", "caster", "C", new Array(madrak), trollbloodBeasts));
addModel(new Model("Tx01", "Madrak Ironhide, World Ender", "caster", "C", new Array(eMadrak), trollbloodBeasts));
var hoarluk = new ModelOption("p", "Hoarluk Doomshaper", null, 16, [{name:'points', value:-7}, {name:"casters", value:1}]);
var eHoarluk = new ModelOption("e", "Hoarluk Doomshaper, Rage of Dhunia", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("TW02", "Hoarluk Doomshaper", "caster", "C", new Array(hoarluk, eHoarluk), trollbloodBeasts));
addModel(new Model("Tw02", "Hoarluk Doomshaper", "caster", "C", new Array(hoarluk), trollbloodBeasts));
addModel(new Model("Tx02", "Hoarluk Doomshaper, Rage of Dhunia", "caster", "C", new Array(eHoarluk), trollbloodBeasts));
var grissel = new ModelOption("p", "Grissel Bloodsong", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eGrissel = new ModelOption("e", "Grissel Bloodsong, Marshal of the Kriels", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("TW03", "Grissel Bloodsong", "caster", "C", new Array(grissel, eGrissel), trollbloodBeasts));
addModel(new Model("Tw03", "Grissel Bloodsong", "caster", "C", new Array(grissel), trollbloodBeasts));
addModel(new Model("Tx03", "Grissel Bloodsong, Marshal of the Kriels", "caster", "C", new Array(eGrissel), trollbloodBeasts));
addModel(new Model("TW04", "Grim Angus", "caster", "C", new Array(
		new ModelOption("p", "Grim Angus", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
), trollbloodBeasts));
addModel(new Model("TW05", "Borka Kegslayer", "caster", "C", new Array(
		new ModelOption("p", "Borka Kegslayer", null, new Array("Borka",18,"Pyg Keg Carrier",5), [{name:'points', value:-5}, {name:"casters", value:1}])
), new ChildGroup(99, "TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB10 TB11 TB12 TB13 TB14")));
addModel(new Model("TW06", "Calandra Truthsayer", "caster", "C", new Array(
		new ModelOption("p", "Calandra Truthsayer, Oracle of the Glimmerwood", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}])
), trollbloodBeasts));
addModel(new Model("TW07", "Captain Gunnbjorn", "caster", "C", new Array(
		new ModelOption("p", "Captain Gunnbjorn", null, 17, [{name:'points', value:-5}, {name:"casters", value:1}])
), trollbloodBeasts));
addModel(new Model("TW08", "Jarl Skuld", "caster", "C", new Array(
		new ModelOption("p", "Jarl Skuld, Devil Of Thornwood", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])
), trollbloodBeasts));

addModel(new Model("TB01", "Pyre Troll", "lightbeast", "U", new Array(new ModelOption("p", "Pyre Troll", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("TB02", "Slag Troll", "lightbeast", "U", new Array(new ModelOption("p", "Slag Troll", null, new Array(7,8,7), [{name:'points', value:6}])), null, true));
addModel(new Model("TB03", "Troll Axer", "lightbeast", "U", new Array(new ModelOption("p", "Troll Axer", null, new Array(7,8,7), [{name:'points', value:6}])), null, true));
addModel(new Model("TB04", "Troll Bouncer", "lightbeast", "U", new Array(new ModelOption("p", "Troll Bouncer", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("TB05", "Troll Impaler", "lightbeast", "U", new Array(new ModelOption("p", "Troll Impaler", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("TB06", "Winter Troll", "lightbeast", "U", new Array(new ModelOption("p", "Winter Troll", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));

addModel(new Model("TB07", "Dire Troll Blitzer", "heavybeast", "U", new Array(new ModelOption("p", "Dire Troll Blitzer", null, new Array(9,10,9), [{name:'points', value:9}])), null, true));
addModel(new Model("TB08", "Dire Troll Mauler", "heavybeast", "U", new Array(new ModelOption("p", "Dire Troll Mauler", null, new Array(9,10,9), [{name:'points', value:9}])), null, true));
addModel(new Model("TB09", "Earthborn Dire Troll", "heavybeast", "U", new Array(new ModelOption("p", "Earthborn Dire Troll", null, new Array(10,11,11), [{name:'points', value:10}])), null, true));
addModel(new Model("TB10", "Mulg the Ancient", "heavybeast", "C", new Array(new ModelOption("p", "Mulg the Ancient", null, new Array(9,13,12), [{name:'points', value:12}])), null, true));
addModel(new Model("TB11", "Dire Troll Bomber", "heavybeast", "U", new Array(new ModelOption("p", "Dire Troll Bomber", null, new Array(9,10,9), [{name:'points', value:10}])), null, true));
addModel(new Model("TB12", "Swamp Troll", "lightbeast", "U", new Array(new ModelOption("p", "Swamp Troll", null, new Array(7,8,7), [{name:'points', value:4}])), null, true));

addModel(new Model("TB13", "Ršk", "heavybeast", "C", new Array(new ModelOption("p", "Ršk", null, new Array(9,10,9), [{name:'points', value:11}])), null, true));
addModel(new Model("TB14", "Storm Troll", "lightbeast", "U", new Array(new ModelOption("p", "Storm Troll", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));

addModel(new Model("TE01", "War Wagon", "battleengine", "2", new Array(new ModelOption("p", "War Wagon", null, 22, [{name:'points', value:9}]))));

addModel(new Model("TU01", "Kriel Warriors", "unit", "3", new Array(
		new ModelOption("6", "Kriel Warriors (Leader and 5 Grunts)", new Array(1, "Kriel Warrior Leader", 5, "Kriel Warrior Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Kriel Warriors (Leader and 9 Grunts)", new Array(1, "Kriel Warrior Leader", 9, "Kriel Warrior Grunt"), null, [{name:'points', value:6}])
	), new Array(new ChildGroup(1, "TA01"),new ChildGroup(1, "TA02"))));
addModel(new Model("TA01", "Kriel Warrior Standard Bearer & Piper", "ua", "1", new Array(new ModelOption("2", "Kriel Warrior Standard Bearer & Piper", new Array(1, "Kriel Warrior Standard Bearer", 1, "Kriel Warrior Piper"), null, [{name:'points', value:2}])), null, true));
addModel(new Model("TA02", "Kriel Warrior Caber Thrower", "ua", "3", new Array(
		new ModelOption("1", "1 Kriel Warrior Caber Thrower", new Array(1, "Kriel Warrior Caber Thrower"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Kriel Warrior Caber Thrower", new Array(2, "Kriel Warrior Caber Thrower"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Kriel Warrior Caber Thrower", new Array(3, "Kriel Warrior Caber Thrower"), null, [{name:'points', value:3}])
	), null, true));

addModel(new Model("TU02", "Krielstone Bearer and Stone Scribes", "unit", "1", new Array(
		new ModelOption("4", "Krielstone Bearer and 3 Stone Scribes", new Array(1, "Krielstone Bearer", 3, "Krielstone Stone Scribes"), null, [{name:'points', value:3}]),
		new ModelOption("6", "Krielstone Bearer and 5 Stone Scribes", new Array(1, "Krielstone Bearer", 5, "Krielstone Stone Scribes"), null, [{name:'points', value:4}])
	), new ChildGroup(1, "TA03")));
addModel(new Model("TA03", "Krielstone Stone Scribe Elder", "ua", "1", new Array(new ModelOption("p", "Krielstone Stone Scribe Elder", null, 5, [{name:'points', value:1}])), null, true));
addModel(new Model("TU03", "Pyg Burrowers", "unit", "1", new Array(
		new ModelOption("6", "Pyg Burrowers (Leader and 5 Grunts)", new Array(1, "Pyg Burrower Leader", 5, "Pyg Burrower Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Pyg Burrowers (Leader and 9 Grunts)", new Array(1, "Pyg Burrower Leader", 9, "Pyg Burrower Grunt"), null, [{name:'points', value:6}])
	)));
addModel(new Model("TU04", "Pyg Bushwackers", "unit", "2", new Array(
		new ModelOption("6", "Pyg Bushwackers (Leader and 5 Grunts)", new Array(1, "Pyg Bushwacker Leader", 5, "Pyg Bushwacker Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Pyg Bushwackers (Leader and 9 Grunts)", new Array(1, "Pyg Bushwacker Leader", 9, "Pyg Bushwacker Grunt"), null, [{name:'points', value:8}])
	)));
addModel(new Model("TU05", "Thumpercrew", "unit", "2", new Array(
		new ModelOption("3", "Thumpercrew (Leader and 2 Crew)", new Array(1, "Thumper Leader", 2, "Thumper Crew"), null, [{name:'points', value:3}])
	)));	
addModel(new Model("TU06", "Trollkin Champions", "unit", "2", new Array(
		new ModelOption("3", "Trollkin Champions (Leader and 2 Grunts)", new Array(1, "Trollkin Champion Leader", 2, "Trollkin Champion Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8), [{name:'points', value:6}]),
		new ModelOption("5", "Trollkin Champions (Leader and 4 Grunts)", new Array(1, "Trollkin Champion Leader", 4, "Trollkin Champion Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8), [{name:'points', value:10}])
), new ChildGroup(1, "TA05")));
addModel(new Model("TA05", "Skaldi Bonehammer", "ua", "C", new Array(new ModelOption("p", "Skaldi Bonehammer", null, 8, [{name:'points', value:3}])), null, true));

addModel(new Model("TU07", "Trollkin Fennblades", "unit", "2", new Array(
		new ModelOption("6", "Trollkin Fennblades (Leader and 5 Grunts)", new Array(1, "Trollkin Fennblade Leader", 5, "Trollkin Fennblade Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Trollkin Fennblades (Leader and 9 Grunts)", new Array(1, "Trollkin Fennblade Leader", 9, "Trollkin Fennblade Grunt"), null, [{name:'points', value:8}])
), new ChildGroup(1, "TA04")));
addModel(new Model("TA04", "Trollkin Fennblade Officer & Drummer", "ua", "1", new Array(new ModelOption("2", "Trollkin Fennblade Officer & Drummer", new Array(1, "Trollkin Fennblade Officer", 1, "Trollkin Fennblade Drummer"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));

addModel(new Model("TU08", "Trollkin Long Riders", "unit", "1", new Array(
		new ModelOption("3", "Trollkin Long Riders (Leader and 2 Grunts)", new Array(1, "Trollkin Long Rider Leader", 2, "Trollkin Long Rider Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8), [{name:'points', value:7}]),
		new ModelOption("5", "Trollkin Long Riders (Leader and 4 Grunts)", new Array(1, "Trollkin Long Rider Leader", 4, "Trollkin Long Rider Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8), [{name:'points', value:11}])
	)));
addModel(new Model("TU09", "Trollkin Runeshapers", "unit", "2", new Array(
		new ModelOption("3", "Trollkin Runeshapers (Leader and 2 Crew)", new Array(1, "Trollkin Runeshaper Leader", 2, "Trollkin Runeshaper Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:4}])
	)));
addModel(new Model("TU10", "Trollkin Scattergunners", "unit", "2", new Array(
		new ModelOption("6", "Trollkin Scattergunners (Leader and 5 Grunts)", new Array(1, "Trollkin Scattergunner Leader", 5, "Trollkin Scattergunner Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Trollkin Scattergunners (Leader and 9 Grunts)", new Array(1, "Trollkin Scattergunner Leader", 9, "Trollkin Scattergunner Grunt"), null, [{name:'points', value:8}])
), new ChildGroup(1, "TA06")));
addModel(new Model("TA06", "Trollkin Scattergunner Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Trollkin Scattergunner Officer & Drummer", new Array(1, "Trollkin Scattergunner Officer", 1, "Trollkin Scattergunner Drummer"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("TU11", "Trollkin Scouts", "unit", "2", new Array(
		new ModelOption("6", "Trollkin Scouts (Leader and 5 Grunts)", new Array(1, "Trollkin Scout Leader", 5, "Trollkin Scout Grunt"), null, [{name:'points', value:5}])
	)));
addModel(new Model("TU12", "Trollkin Sluggers", "unit", "1", new Array(
		new ModelOption("3", "Trollkin Sluggers (Leader and 2 Grunts)", new Array(1, "Trollkin Sluggers Leader", 2, "Trollkin Sluggers Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:5}]),
		new ModelOption("5", "Trollkin Sluggers (Leader and 4 Grunts)", new Array(1, "Trollkin Sluggers Leader", 4, "Trollkin Sluggers Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5, "Model d", 5, "Model e", 5), [{name:'points', value:8}])
	)));
addModel(new Model("TU13", "Sons of Bragg", "unit", "C", new Array(
		new ModelOption("3", "Sons of Bragg", new Array(3, "Sons of Bragg"), new Array("Wrathar",8,"Tor",8,"Rhudd",8), [{name:'points', value:6}])
	)));

addModel(new Model("TS01", "Fell Caller Hero", "solo", "2", new Array(new ModelOption("p", "Fell Caller Hero", null, 8, [{name:'points', value:3}]))));
addModel(new Model("TS02", "Stone Scribe Chronicler", "solo", "1", new Array(new ModelOption("p", "Stone Scribe Chronicler", null, 5, [{name:'points', value:2}]))));
addModel(new Model("TS03", "Troll Whelps", "solo", "3", new Array(new ModelOption("5", "Troll Whelps", new Array(5, "Troll Whelp"), null, [{name:'points', value:2}]))));
addModel(new Model("TS04", "Trollkin Champion Hero", "solo", "2", new Array(new ModelOption("p", "Trollkin Champion Hero", null, 8, [{name:'points', value:3}]))));
addModel(new Model("TS05", "Horthol, Long Rider Champion", "solo", "C", new Array(new ModelOption("m", "Horthol, Long Rider Hero", null, new Array("Horthol (mounted)", 10, "Horthol (dismounted)", 8), [{name:'points', value:5}]))));
addModel(new Model("TS06", "Trollkin Runebearer", "solo", "1", new Array(new ModelOption("p", "Trollkin Runebearer", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("TS07", "Trollblood Skinner", "solo", "2", new Array(new ModelOption("p", "Trollblood Skinner", null, 5, [{name:'points', value:2}]))));
addModel(new Model("TS08", "Janissa Stonetide", "solo", "C", new Array(new ModelOption("p", "Janissa Stonetide", null, 8, [{name:'points', value:3}]))));var skorneColors = new Array("#BFC55B","#E52937");
var skorneFaction = new Faction("Skorne", "S", skorneColors);
factions.push(skorneFaction);

var skorneBeasts = new ChildGroup(99, "SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB10 SB11 SB12 SB13 SB14 SB15 SS08");

var morghoul = new ModelOption("p", "Master Tormentor Morghoul", null, 15, [{name:'points', value:-7}, {name:"casters", value:1}]);
var eMorghoul = new ModelOption("e", "Lord Assassin Morghoul", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("SW01", "Morghoul", "caster", "C", new Array(morghoul, eMorghoul), skorneBeasts));
addModel(new Model("Sw01", "Master Tormentor Morghoul", "caster", "C", new Array(morghoul), skorneBeasts));
addModel(new Model("Sx01", "Lord Assassin Morghoul", "caster", "C", new Array(eMorghoul), skorneBeasts));

var makeda = new ModelOption("p", "Archdomina Makeda", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}]);
var eMakeda = new ModelOption("e", "Supreme Archdomina Makeda", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}]);
addModel(new Model("SW02", "Makeda", "caster", "C", new Array(makeda, eMakeda), skorneBeasts));
addModel(new Model("Sw02", "Archdomina Makeda", "caster", "C", new Array(makeda), skorneBeasts));
addModel(new Model("Sx02", "Supreme Archdomina Makeda", "caster", "C", new Array(eMakeda), skorneBeasts));

var makeda = new ModelOption("p", "Lord Tyrant Hexeris", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
var eMakeda = new ModelOption("e", "Lord Arbiter Hexeris", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}]);
addModel(new Model("SW03", "Hexeris", "caster", "C", new Array(makeda, eMakeda), skorneBeasts));
addModel(new Model("Sw03", "Lord Tyrant Hexeris", "caster", "C", new Array(makeda), skorneBeasts));
addModel(new Model("Sx03", "Lord Arbiter Hexeris", "caster", "C", new Array(eMakeda), skorneBeasts));

addModel(new Model("SW04", "Xerxis", "caster", "C", new Array(
		new ModelOption("p", "Tyrant Xerxis", null, 19, [{name:'points', value:-5}, {name:"casters", value:1}])
), skorneBeasts));

addModel(new Model("SW05", "Zaal & Kovaas", "caster", "C", new Array(
		new ModelOption("p", "Supreme Aptimus Zaal & Kovaas", new Array(1, "Supreme Aptimus Zaal", 1, "Kovaas"), new Array("Zaal", 15, "Kovaas", 5), [{name:'points', value:-5}, {name:"casters", value:1}])
), skorneBeasts));

addModel(new Model("SW06", "Mordikaar", "caster", "C", new Array(
		new ModelOption("p", "Void Seer Mordikaar", null, 16, [{name:'points', value:-5}, {name:"casters", value:1}])
), skorneBeasts));

addModel(new Model("SW07", "Rasheth", "caster", "C", new Array(
		new ModelOption("p", "Dominar Rasheth", null, 20, [{name:'points', value:-5}, {name:"casters", value:1}])
), skorneBeasts));

addModel(new Model("SW08", "Naaresh", "caster", "C", new Array(
		new ModelOption("p", "Master Ascetic Naaresh", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])
), skorneBeasts));

addModel(new Model("SB01", "Cyclops Savage", "lightbeast", "U", new Array(new ModelOption("p", "Cyclops Savage", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("SB02", "Cyclops Brute", "lightbeast", "U", new Array(new ModelOption("p", "Cyclops Brute", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("SB03", "Cyclops Shaman", "lightbeast", "U", new Array(new ModelOption("p", "Cyclops Shaman", null, new Array(7,6,9), [{name:'points', value:5}])), null, true));
addModel(new Model("SB04", "Basilisk Drake", "lightbeast", "U", new Array(new ModelOption("p", "Basilisk Drake", null, new Array(7,5,7), [{name:'points', value:4}])), null, true));
addModel(new Model("SB05", "Basilisk Krea", "lightbeast", "U", new Array(new ModelOption("p", "Basilisk Krea", null, new Array(7,5,9), [{name:'points', value:4}])), null, true));

addModel(new Model("SB06", "Titan Gladiator", "heavybeast", "U", new Array(new ModelOption("p", "Titan Gladiator", null, new Array(9,12,9), [{name:'points', value:8}])), null, true));
addModel(new Model("SB07", "Titan Cannoneer", "heavybeast", "U", new Array(new ModelOption("p", "Titan Cannoneer", null, new Array(9,10,7), [{name:'points', value:9}])), null, true));
addModel(new Model("SB08", "Bronzeback Titan", "heavybeast", "U", new Array(new ModelOption("p", "Bronzeback Titan", null, new Array(9,14,10), [{name:'points', value:10}])), null, true));
addModel(new Model("SB09", "Rhinodon", "heavybeast", "U", new Array(new ModelOption("p", "Rhinodon", null, new Array(7,11,9), [{name:'points', value:7}])), null, true));
addModel(new Model("SB10", "Molik Karn", "heavybeast", "C", new Array(new ModelOption("p", "Molik Karn", null, new Array(9,10,9), [{name:'points', value:11}])), null, true));
addModel(new Model("SB11", "Titan Sentry", "heavybeast", "U", new Array(new ModelOption("p", "Titan Sentry", null, new Array(9,12,9), [{name:'points', value:9}])), null, true));

addModel(new Model("SB12", "Razorworm", "lightbeast", "U", new Array(new ModelOption("p", "Razorworm", null, new Array(5,8,8), [{name:'points', value:4}])), null, true));
addModel(new Model("SB13", "Tiberion", "heavybeast", "C", new Array(new ModelOption("p", "Tiberion", null, new Array(10,10,10), [{name:'points', value:11}])), null, true));
addModel(new Model("SB14", "Cyclops Raider", "lightbeast", "U", new Array(new ModelOption("p", "Cyclops Raider", null, new Array(7,8,7), [{name:'points', value:5}])), null, true));
addModel(new Model("SB15", "Archidon", "heavybeast", "U", new Array(new ModelOption("p", "Archidon", null, new Array(7,10,7), [{name:'points', value:7}])), null, true));

addModel(new Model("SE01", "Siege Animantarax", "battleengine", "2", new Array(new ModelOption("p", "Siege Animantarax", null, 22, [{name:'points', value:9}]))));

addModel(new Model("SU01", "Bloodrunners", "unit", "2", new Array(
		new ModelOption("6", "Bloodrunners (Leader and 5 Grunts)", new Array(1, "Bloodrunner Leader", 5, "Bloodrunner Grunt"), null, [{name:'points', value:5}])
	)));
addModel(new Model("SU02", "Cataphract Arcuarii", "unit", "2", new Array(
		new ModelOption("4", "Cataphract Arcuarii (Leader and 3 Grunts)", new Array(1, "Cataphract Arcuarii Leader", 3, "Cataphract Arcuarii Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8), [{name:'points', value:6}]),
		new ModelOption("6", "Cataphract Arcuarii (Leader and 5 Grunts)", new Array(1, "Cataphract Arcuarii Leader", 5, "Cataphract Arcuarii Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8, "Model f", 8), [{name:'points', value:9}])
	), new ChildGroup(1, "SA04")));
addModel(new Model("SU03", "Cataphract Cetrati", "unit", "2", new Array(
		new ModelOption("4", "Cataphract Cetrati (Leader and 3 Grunts)", new Array(1, "Cataphract Cetrati Leader", 3, "Cataphract Cetrati Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8), [{name:'points', value:8}]),
		new ModelOption("6", "Cataphract Cetrati (Leader and 5 Grunts)", new Array(1, "Cataphract Cetrati Leader", 5, "Cataphract Cetrati Grunt"), new Array("Model a", 8, "Model b", 8, "Model c", 8, "Model d", 8, "Model e", 8, "Model f", 8), [{name:'points', value:11}])
	), new ChildGroup(1, "SA03")));
addModel(new Model("SA03", "Tyrant Vorkesh", "ua", "C", new Array(new ModelOption("1", "Tyrant Vorkesh", new Array(1, "Tyrant Vorkesh"), 8, [{name:'points', value:3}])), null, true));
addModel(new Model("SU04", "Immortals", "unit", "2", new Array(
		new ModelOption("6", "Immortals (Leader and 5 Grunts)", new Array(1, "Immortal Leader", 5, "Immortal Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Immortals (Leader and 9 Grunts)", new Array(1, "Immortal Leader", 9, "Immortal Grunt"), null, [{name:'points', value:8}])
	)));
addModel(new Model("SU05", "Paingiver Beast Handlers", "unit", "2", new Array(
		new ModelOption("4", "Paingiver Beast Handlers (Leader and 3 Grunts)", new Array(1, "Paingiver Beast Handler Leader", 3, "Paingiver Beast Handler Grunt"), null, [{name:'points', value:2}]),
		new ModelOption("6", "Paingiver Beast Handlers (Leader and 5 Grunts)", new Array(1, "Paingiver Beast Handler Leader", 5, "Paingiver Beast Handler Grunt"), null, [{name:'points', value:3}])
	)));
addModel(new Model("SU06", "Praetorian Ferox", "unit", "1", new Array(
		new ModelOption("3", "Praetorian Ferox (Leader and 2 Grunts)", new Array(1, "Praetorian Ferox Leader", 2, "Praetorian Ferox Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5), [{name:'points', value:7}]),
		new ModelOption("5", "Praetorian Ferox (Leader and 4 Grunts)", new Array(1, "Praetorian Ferox Leader", 4, "Praetorian Ferox Grunt"), new Array("Model a", 5, "Model b", 5, "Model c", 5, "Model d", 5, "Model e", 5), [{name:'points', value:11}])
	)));
addModel(new Model("SU07", "Praetorian Karax", "unit", "2", new Array(
		new ModelOption("6", "Praetorian Karax (Leader and 5 Grunts)", new Array(1, "Praetorian Karax Leader", 5, "Praetorian Karax Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Praetorian Karax (Leader and 9 Grunts)", new Array(1, "Praetorian Karax Leader", 9, "Praetorian Karax Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "SA04")));
addModel(new Model("SU08", "Praetorian Swordsmen", "unit", "3", new Array(
		new ModelOption("6", "Praetorian Swordsmen (Leader and 5 Grunts)", new Array(1, "Praetorian Swordsman Leader", 5, "Praetorian Swordsman Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Praetorian Swordsmen (Leader and 9 Grunts)", new Array(1, "Praetorian Swordsman Leader", 9, "Praetorian Swordsman Grunt"), null, [{name:'points', value:6}])
	), new ChildGroup(1, "SA01")));
addModel(new Model("SA01", "Praetorian Swordsmen Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Praetorian Swordsmen Officer & Standard", new Array(1, "Praetorian Swordsmen Officer", 1, "Praetorian Swordsmen Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("SU09", "Tyrant Commander & Standard Bearer", "unit", "2", new Array(
		new ModelOption("2", "Tyrant Commander & Standard Bearer", new Array(1, "Tyrant Commander", 1, "Tyrant Commander Standard Bearer"), new Array("Tyrant", 8, "Standard", 5), [{name:'points', value:3}])
	)));

addModel(new Model("SU10", "Venator Catapult Crew", "unit", "2", new Array(
		new ModelOption("3", "Venator Catapult Crew (Leader and 2 Grunts)", new Array(1, "Venator Catapult Crew Leader", 2, "Venator Catapult Crew Grunt"), null, [{name:'points', value:3}])
	)));
addModel(new Model("SU11", "Venators Reivers", "unit", "3", new Array(
		new ModelOption("6", "Venators Reivers (Leader and 5 Grunts)", new Array(1, "Venator Reivers Leader", 5, "Venator Reivers Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Venators Reivers (Leader and 9 Grunts)", new Array(1, "Venator Reivers Leader", 9, "Venator Reivers Grunt"), null, [{name:'points', value:9}])
	), new ChildGroup(1, "SA02")));
addModel(new Model("SA02", "Venators Reiver Officer & Standard", "ua", "1", new Array(new ModelOption("2", "Venators Reiver Officer & Standard", new Array(1, "Venators Reiver Officer", 1, "Venators Reiver Standard"), new Array("Officer", 5), [{name:'points', value:2}])), null, true));
addModel(new Model("SU12", "Nihilators", "unit", "2", new Array(
		new ModelOption("6", "Nihilators (Leader and 5 Grunts)", new Array(1, "Nihilators Leader", 5, "Nihilators Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Nihilators (Leader and 9 Grunts)", new Array(1, "Nihilators Leader", 9, "Nihilators Grunt"), null, [{name:'points', value:8}])
	)));
addModel(new Model("SU13", "Venator Flayer Cannon Crew", "unit", "2", new Array(
		new ModelOption("2", "Venator Flayer Cannon Crew (Leader and 1 Grunts)", new Array(1, "Venator Flayer Cannon Crew Leader", 1, "Venator Flayer Cannon Crew Grunt"), null,[{name:'points', value: 2}])
	)));
addModel(new Model("SU14", "Venators Slingers", "unit", "2", new Array(
		new ModelOption("6", "Venators Slingers (Leader and 5 Grunts)", new Array(1, "Venator Slingers Leader", 5, "Venator Slingers Grunt"), null, [{name:'points', value:4}]),
		new ModelOption("10", "Venators Slingers (Leader and 9 Grunts)", new Array(1, "Venator Slingers Leader", 9, "Venator Slingers Grunt"), null, [{name:'points', value:6}])
	)));
addModel(new Model("SA04", "Venator Reivers", "ua", "2", new Array(
		new ModelOption("1", "1 Venator Reiver", new Array(1, "Venator Reiver"), null, [{name:'points', value:1}]),
		new ModelOption("2", "2 Venator Reivers", new Array(2, "Venator Reiver"), null, [{name:'points', value:2}]),
		new ModelOption("3", "3 Venator Reivers", new Array(3, "Venator Reiver"), null, [{name:'points', value:3}])
	), null, true));
    
    
addModel(new Model("SS01", "Agonizer", "solo", "1", new Array(new ModelOption("p", "Agonizer", null, 8, [{name:'points', value:2}]))));
addModel(new Model("SS02", "Ancestral Guardian", "solo", "3", new Array(new ModelOption("p", "Ancestral Guardian", null, 10, [{name:'points', value:3}]))));
addModel(new Model("SS03", "Bloodrunner Master Tormentor", "solo", "2", new Array(new ModelOption("p", "Bloodrunner Master Tormentor", null, 5, [{name:'points', value:2}]))));
addModel(new Model("SS04", "Extoler Soulward", "solo", "2", new Array(new ModelOption("p", "Extoler Soulward", null, 5, [{name:'points', value:2}]))));
addModel(new Model("SS05", "Tyrant Rhadiem", "solo", "C", new Array(new ModelOption("m", "Tyrant Rhadiem", null, new Array("Tyrant Rhadiem (mounted)", 10, "Tyrant Rhadiem (dismounted)", 5), [{name:'points', value:5}]))));
addModel(new Model("SS06", "Void Spirit", "solo", "2", new Array(new ModelOption("p", "Void Spirit", null, 5, [{name:'points', value:2}]))));
addModel(new Model("SS07", "Paingiver Task Master", "solo", "2", new Array(new ModelOption("p", "Paingiver Task Master", null, 5, [{name:'points', value:2}]))));
addModel(new Model("SS08", "Aptimus Marketh", "solo", "C", new Array(new ModelOption("p", "Aptimus Marketh", null, 5, [{name:'points', value:3}])), null, true));
addModel(new Model("SS09", "Hakaar the Destroyer", "solo", "C", new Array(new ModelOption("p", "Hakaar the Destroyer", null, 10, [{name:'points', value:4}]))));var minionColors = new Array("#79591C","#9E792B");
var minionFaction = new Faction("Minions", "I", minionColors);
factions.push(minionFaction);

/*OT Searforge	    * Lesser Warlock Brun Cragback & Lug
OT R	    * Lesser Warlock Dahlia Hallyr & Skarath
SOET	    * Lesser Warlock Rorsh & Brine
SOET	    * Lesser Warlock Wrong Eye & Snapjaw
*/
addModel(new Model("IW01", "Brun Cragback & Lug", "solo", "C", new Array(new ModelOption("p", "Brun Cragback & Lug", new Array(1, "Brun Cragback", 1, "Lug"), new Array("Brun Cragback", 8, "Lug", new Array(8,11,8)),[{name:'points', value:9}]))));
addModel(new Model("IW02", "Dahlia Hallyr & Skarath", "solo", "C", new Array(new ModelOption("p", "Dahlia Hallyr & Skarath", new Array(1, "Dahlia Hallyr", 1, "Skarath"), new Array("Dahlia Hallyr", 8, "Skarath", new Array(7,9,9)),[{name:'points', value:9}]))));
addModel(new Model("IW03", "Rorsh & Brine", "solo", "C", new Array(new ModelOption("p", "Rorsh & Brine", new Array(1, "Rorsh", 1, "Brine"), new Array("Rorsh", 8, "Brine", new Array(5,12,9)),[{name:'points', value:9}])), new ChildGroup(99, "IB01 IB02 Ib01 Ib02 IB06 Ib06")));
addModel(new Model("IW04", "Wrong Eye & Snapjaw", "solo", "C", new Array(new ModelOption("p", "Wrong Eye & Snapjaw", new Array(1, "Wrong Eye", 1, "Snapjaw"), new Array("Wrong Eye", 8, "Snapjaw", new Array(5,14,8)),[{name:'points', value:9}])), new ChildGroup(99, "IB03 IB04 IB05 Ib03 Ib04 Ib05 IB07 IB08 Ib07 Ib08")));

addModel(new Model("IW05", "Lord Carver", "caster", "C", new Array(new ModelOption("p", "Lord Carver", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])), new ChildGroup(99, "IB01 IB02 IB06 IS10")));
addModel(new Model("IW06", "Bloody Barnabas", "caster", "C", new Array(new ModelOption("p", "Bloody Barnabas", null, 16, [{name:'points', value:-6}, {name:"casters", value:1}])), new ChildGroup(99, "IB03 IB04 IB05 IB07 IB08 IS10")));
addModel(new Model("IW07", "Calaban, the Gravewalker", "caster", "C", new Array(new ModelOption("p", "Calaban, the Gravewalker", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}])), new ChildGroup(99, "IB03 IB04 IB05 IB07 IB08 IS10")));
addModel(new Model("IW08", "Dr. Arkadius", "caster", "C", new Array(new ModelOption("p", "Dr. Arkadius", null, 15, [{name:'points', value:-6}, {name:"casters", value:1}])), new ChildGroup(99, "IB01 IB02 IB06 IS10")));
addModel(new Model("IW09", "Maelok, the Dreadbound", "caster", "C", new Array(new ModelOption("p", "Maelok, the Dreadbound", null, 17, [{name:'points', value:-6}, {name:"casters", value:1}])), new ChildGroup(99, "IB03 IB04 IB05 IB07 IB08 IS10")));
addModel(new Model("IW10", "Sturm und Drang", "caster", "C", new Array(new ModelOption("p", "Sturm und Drang", null, 18, [{name:'points', value:-5}, {name:"casters", value:1}])), new ChildGroup(99, "IB01 IB02 IB06 IB07 IB08 IS10")));

addModel(new Model("IB01", "Gun Boar", "lightbeast", "U", new Array(new ModelOption("p", "Gun Boar", null, new Array(6,10,6), [{name:'points', value:5}])), null, true));
addModel(new Model("IB02", "War Hog", "heavybeast", "U", new Array(new ModelOption("p", "War Hog", null, new Array(9,12,7), [{name:'points', value:8}])), null, true));
addModel(new Model("IB03", "Blackhide Wrastler", "heavybeast", "U", new Array(new ModelOption("p", "Blackhide Wrastler", null, new Array(5,14,8), [{name:'points', value:9}])), null, true));
addModel(new Model("IB04", "Bull Snapper", "lightbeast", "U", new Array(new ModelOption("p", "Bull Snapper", null, new Array(4,7,5), [{name:'points', value:3}])), null, true));
addModel(new Model("IB05", "Ironback Spitter", "heavybeast", "U", new Array(new ModelOption("p", "Ironback Spitter", null, new Array(7,11,9), [{name:'points', value:8}])), null, true));
addModel(new Model("IB06", "Road Hog", "heavybeast", "U", new Array(new ModelOption("p", "Road Hog", null, new Array(9,12,9), [{name:'points', value:9}])), null, true));
addModel(new Model("IB07", "Bone Swarm", "lightbeast", "U", new Array(new ModelOption("p", "Bone Swarm", null, new Array(5,7,6), [{name:'points', value:4}])), null, true));
addModel(new Model("IB08", "Swamp Horror", "heavybeast", "U", new Array(new ModelOption("p", "Swamp Horror", null, new Array(8,11,8), [{name:'points', value:8}])), null, true));

// Hack for minor warcaster beasts tiers
addModel(new Model("Ib01", "Carver tier 2: Gun Boar", "lightbeast", "U", new Array(new ModelOption("p", "Gun Boar", null, new Array(6,10,6), [{name:'points', value:5}])), null, true));
addModel(new Model("Ib02", "Carver tier 2: War Hog", "heavybeast", "U", new Array(new ModelOption("p", "War Hog", null, new Array(9,12,7), [{name:'points', value:8}])), null, true));
addModel(new Model("Ib03", "Calaban tier 3: Blackhide Wrastler", "heavybeast", "U", new Array(new ModelOption("p", "Blackhide Wrastler", null, new Array(5,14,8), [{name:'points', value:9}])), null, true));
addModel(new Model("Ib04", "Calaban tier 3: Bull Snapper", "lightbeast", "U", new Array(new ModelOption("p", "Bull Snapper", null, new Array(4,7,5), [{name:'points', value:3}])), null, true));
addModel(new Model("Ib05", "Calaban tier 3: Ironback Spitter", "heavybeast", "U", new Array(new ModelOption("p", "Ironback Spitter", null, new Array(7,11,9), [{name:'points', value:8}])), null, true));
addModel(new Model("Ib06", "Carver tier 2: Road Hog", "heavybeast", "U", new Array(new ModelOption("p", "Road Hog", null, new Array(9,12,9), [{name:'points', value:9}])), null, true));
addModel(new Model("Ib07", "Calaban tier 3: Bone Swarm", "lightbeast", "U", new Array(new ModelOption("p", "Bone Swarm", null, new Array(5,7,6), [{name:'points', value:4}])), null, true));
addModel(new Model("Ib08", "Calaban tier 3: Swamp Horror", "heavybeast", "U", new Array(new ModelOption("p", "Swamp Horror", null, new Array(8,11,8), [{name:'points', value:8}])), null, true));


/*
OT	YKP   # Alten Ashley, Monster Hunter
SOET	# Feralgeist
SOET CYK & searforge	# Gudrun the Wanderer
OT	YR Animosity legion or blighted # Lanyssa Ryssyll, Nyss Sorceress
OT	Animosity Orrik # Professor Victor Pendrake
SOT	CKP # Saxon Orrik
SOET	# Totem Hunter
SOET    # Thrullg
SOET    # Croak Hunter
SOET	# Targ
SOET	# Witch Doctor
*/
addModel(new Model("IS01", "Alten Ashley, Monster Hunter", "solo", "C", new Array(new ModelOption("p", "Alten Ashley, Monster Hunter", null, 5, [{name:'points', value:2}]))));
addModel(new Model("IS02", "Feralgeist", "solo", "3", new Array(new ModelOption("p", "Feralgeist", null, null, [{name:'points', value:1}]))));
addModel(new Model("IS03", "Gudrun the Wanderer", "solo", "C", new Array(new ModelOption("p", "Gudrun the Wanderer", null, new Array("First time",8,"Hangover!",8),[{name:'points', value:3}]))));
addModel(new Model("IS04", "Lanyssa Ryssyll, Nyss Sorceress", "solo", "C", new Array(new ModelOption("p", "Lanyssa Ryssyll, Nyss Sorceress", null, 5, [{name:'points', value:2}]))));
addModel(new Model("IS05", "Professor Victor Pendrake", "solo", "C", new Array(new ModelOption("p", "Professor Victor Pendrake", null, 5, [{name:'points', value:2}])), null, null, "IS06"));
addModel(new Model("IS06", "Saxon Orrik", "solo", "C", new Array(new ModelOption("p", "Saxon Orrik", null, 5, [{name:'points', value:2}])), null, null, "IS05"));
addModel(new Model("IS07", "Totem Hunter", "solo", "C", new Array(new ModelOption("p", "Totem Hunter", null, 8, [{name:'points', value:3}]))));
addModel(new Model("IS08", "Thrullg", "solo", "2", new Array(new ModelOption("p", "Thrullg", null, 8, [{name:'points', value:3}]))));
addModel(new Model("IS09", "Croak Hunter", "solo", "3", new Array(new ModelOption("p", "Croak Hunter", null, 5, [{name:'points', value:2}]))));
addModel(new Model("IS10", "Targ", "solo", "C", new Array(new ModelOption("p", "Targ", null, 5, [{name:'points', value:2}])), null, true));
addModel(new Model("IS11", "Gatorman Witch Doctor", "solo", "2", new Array(new ModelOption("p", "Gatorman Witch Doctor", null, 8, [{name:'points', value:3}]))));
addModel(new Model("Is11", "Gatorman Witch Doctor", "solo", "3", new Array(new ModelOption("p", "Gatorman Witch Doctor", null, 8, [{name:'points', value:3}]))));

/*
Units
 
SOET    * Bog Trog Ambushers
SOET    * Farrow Bone Grinders
SOET    * Farrow Brigands
SOET    * Gatormen Posse
SOET    * Swamp Gobber Bellows Crew
SOET    * Farrow Razorback Crew
*/
addModel(new Model("IU01", "Bog Trog Ambushers", "unit", "2", new Array(
		new ModelOption("6", "Bog Trog Ambushers (Leader and 5 Grunts)", new Array(1, "Bog Trog Ambusher Leader", 5, "Bog Trog Ambusher Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Bog Trog Ambushers (Leader and 9 Grunts)", new Array(1, "Bog Trog Ambusher Leader", 9, "Bog Trog Ambusher Grunt"), null, [{name:'points', value:8}])
	)));
addModel(new Model("IU02", "Farrow Bone Grinders", "unit", "2", new Array(
		new ModelOption("4", "Farrow Bone Grinders (Leader and 3 Grunts)", new Array(1, "Farrow Bone Grinder Leader", 3, "Farrow Bone Grinder Grunt"), null, [{name:'points', value:2}]),
		new ModelOption("6", "Farrow Bone Grinders (Leader and 5 Grunts)", new Array(1, "Farrow Bone Grinder Leader", 5, "Farrow Bone Grinder Grunt"), null, [{name:'points', value:3}])
	)));	
addModel(new Model("IU03", "Farrow Brigands", "unit", "2", new Array(
		new ModelOption("6", "Farrow Brigands (Leader and 5 Grunts)", new Array(1, "Farrow Brigand Leader", 5, "Farrow Brigand Grunt"), null, [{name:'points', value:5}]),
		new ModelOption("10", "Farrow Brigands (Leader and 9 Grunts)", new Array(1, "Farrow Brigand Leader", 9, "Farrow Brigand Grunt"), null, [{name:'points', value:8}])
	)));
addModel(new Model("IU04", "Gatormen Posse", "unit", "2", new Array(
		new ModelOption("3", "Gatormen Posse (Leader and 2 Grunts)", new Array(1, "Gatormen Posse Leader", 2, "Gatormen Posse Grunt"), new Array("Model a",8,"Model b",8,"Model c",8), [{name:'points', value:6}]),
		new ModelOption("5", "Gatormen Posse (Leader and 4 Grunts)", new Array(1, "Gatormen Posse Leader", 4, "Gatormen Posse Grunt"), new Array("Model a",8,"Model b",8,"Model c",8,"Model d",8,"Model e",8), [{name:'points', value:9}])
	)));
addModel(new Model("Iu04", "Gatormen Posse", "unit", "3", new Array(
		new ModelOption("3", "Gatormen Posse (Leader and 2 Grunts)", new Array(1, "Gatormen Posse Leader", 2, "Gatormen Posse Grunt"), new Array("Model a",8,"Model b",8,"Model c",8), [{name:'points', value:6}]),
		new ModelOption("5", "Gatormen Posse (Leader and 4 Grunts)", new Array(1, "Gatormen Posse Leader", 4, "Gatormen Posse Grunt"), new Array("Model a",8,"Model b",8,"Model c",8,"Model d",8,"Model e",8), [{name:'points', value:9}])
	)));
addModel(new Model("IU05", "Swamp Gobber Bellows Crew", "unit", "1", new Array(
		new ModelOption("2", "Swamp Gobber Bellows Crew (Leader and 1 Grunt)", new Array(1, "Swamp Gobber Bellows Crew Leader", 1, "Swamp Gobber Bellows Crew Grunt"), null, [{name:'points', value:1}])
	)));		
addModel(new Model("IU06", "Farrow Razorback Crew", "unit", "2", new Array(
		new ModelOption("2", "Farrow Razorback Crew (Leader and 1 Grunt)", new Array(1, "Farrow Razorback Crew Leader", 1, "Farrow Razorback Crew Grunt"), null, [{name:'points', value:3}])
	)));		
addModel(new Model("IU07", "Farrow Slaughterhousers", "unit", "2", new Array(
		new ModelOption("6", "Farrow Slaughterhousers (Leader and 5 Grunt)", new Array(1, "Farrow Slaughterhouser Leader", 5, "Farrow Slaughterhouser Grunt"), null, [{name:'points', value:6}])
	)));		
		var cygnarArmy = new Army("Cygnar", null, true, [
addWMHTierArmy(new Army("Haley - The Dead Line", null, null, false, new Array(new Tier("Only", "Yw01 YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ14 YJ15 YJ18 YJ19 YJ20 YJ02 YJ06 YU03 YU02 YA07 YU12 YA06 YU08 YA05 YS02 YS01", "PC","YU02--1"),
		new Tier("Must have", "2YU02", "free", "YA07"),
		new Tier("Must have jackmarshalled", "1(YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ14 YJ15 YJ18 YJ19 YJ02)"),
		new Tier("Must have in battlegroup", "2YJ04")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Haley - Gravediggers", null, null, false, new Array(new Tier("Only", "Yx01 YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ14 YJ15 YJ18 YJ19 YJ20 YJ02 YJ06 YU03 YU05 YA03 YA04 YU06 YU07 YU14 YA08 YS04 YS08"),
		new Tier("Must have", "YS04"),
		new Tier("Must have", "2(YU05 YU14)"),
		new Tier("Must have", "2(YJ07 YJ10 YJ14 YJ19)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Haley - Storm Bringers (NQ37)", null, null, false, new Array(new Tier("Only", "Yx01 YJ11 YJ15 YJ10 YJ06 YJ20 YU04 YA02 YA09 YU01 YA01 YU11 YU03 YU15 YS03 YS02 YS07 YE01"),
		new Tier("Must have", "YU15 YS03", "FA", "YS03-4"),
		new Tier("Must have", "YJ06"),
		new Tier("Must have", "2YE01")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Stryker - Combined Arms", null, null, false, new Array(new Tier("Only", "Yw02 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ13 YJ18 YJ19 YJ20 YU03 YU02 YA07 YU05 YA03 YA04 YU04 YA02 YA09 YS01"),
		new Tier("Must have", "YJ13"),
		new Tier("Must have", "2(YU02)", "free", "YA07"),
		new Tier("Must have", "2(YJ02)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Stryker - Charge of the Storm Brigade", null, null, false, new Array(new Tier("Only", "Yx02 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ13 YJ11 YJ18 YJ19 YJ20 YU03 YU10 YU04 YA02 YA09 YU09 YU15 YS06 YS05", "FA", "YU10-2", "PC", "YJ10--1"),
		new Tier("Must have", "2YU04", "free", "YA02"),
		new Tier("Must have", "YS05"),
		new Tier("Must have", "2YJ10")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Caine - Sons of the Tempest", null, null, false, new Array(new Tier("Only", "Yw03 YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ12 YJ14 YJ15 YJ18 YJ19 YJ20 YJ02 YU01 YA01 YU11 YS02", "FA", "YU01-U", "PC", "YU01--1"),
		new Tier("Must have", "2YU01", "free", "YA01"),
		new Tier("Must have", "3(YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ12 YJ14 YJ15 YJ18 YJ19 YJ20 YJ02)"),
		new Tier("Must have", "YU11")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Caine - The Huntsman", null, null, false, new Array(new Tier("Only", "Yx03 YJ01 YJ02 YJ03 YJ04 YJ05 YJ15 YJ18 YU01 YA01 YU11 YU13 YS02"),
		new Tier("Must have", "2YU01", "free", "YS02"),
		new Tier("Must have", "YU13"),
		new Tier("Must have", "2YJ02")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Caine - The Street Sweepers (NQ34)", null, null, false, new Array(new Tier("Only", "Yx03 YJ01 YJ02 YJ03 YJ04 YJ05 YJ15 YJ18 YU05 YA03 YA04 YU14 YA08 YS04 YS08"),
		new Tier("Must have", "YU14", "PC", "YA08--1"),
		new Tier("Must have", "2(YU05 YU14)"),
		new Tier("Must have in battlegroup", "3(YJ01 YJ02 YJ03 YJ04 YJ05 YJ15 YJ18)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Nemo - Eye of the Storm", null, null, false, new Array(new Tier("Only", "Yw04 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ11 YJ18 YJ19 YJ20 YU03 YU10 YU04 YA02 YA09 YU09 YS01 YS06 YS05 YS03"),
		new Tier("Must have", "2(YJ01 YJ02 YJ03 YJ04 YJ05 YJ15 YJ18)"),
		new Tier("Must have", "2(YU04)", "free", "YA02"),
		new Tier("Must have in battlegroup", "YJ11")  
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("epic Nemo - The Weathermen", null, null, false, new Array(new Tier("Only", "Yx04 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ11 YJ18 YJ19 YJ20 YU03 YU09 YU15 YS01 YS06 YS03", "FA", "YS03-+1-YJ07|YJ08|YJ09|YJ10|YJ11|YJ12|YJ14|YJ19"),
		new Tier("Must have", "2YJ15"),
		new Tier("Must have", "2YU09", "free", "YU15"),
		new Tier("Must have", "2(YJ07 YJ08 YJ09 YJ10 YJ11 YJ12 YJ14 YJ19)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Nemo3 - Lightning War", null, null, false, new Array(new Tier("Only", "Yz04 YJ02 YJ10 YJ11 YJ15 YJ20 YE01 YU03 YU04 YU09 YU10 YU15 YA02 YA09 YS01 YS03 YS05 YS07", "PC", "YU09--1"),
		new Tier("Must have", "YJ20"),
		new Tier("Must have", "2(YU03 YU04 YU09 YU10 YU15)"),
		new Tier("Must have", "YJ11")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Siege - The Big Guns", null, null, false, new Array(new Tier("Only", "YW05 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ16 YJ18 YJ19 YJ20 YU03 YU13 YU05 YA03 YA04 YU06 YU07 YU14 YA08 YS01 YS04 YS08", "FA", "YU06-+1-YU05|YU14 YU07-+1-YU05|YU14", "PC", "YU05--1 YU14--1"), 
		new Tier("Must have", "3(YU06 YU07)", "free", "YS08"),
		new Tier("Must have", "2(YU05 YU14)"),
		new Tier("Must have", "2(YJ07)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Kraye - Mobile Strike Force", null, null, false, new Array(new Tier("Only", "YW06 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ18 YJ19 YJ20 YU03 YU13 YU11 YS02", "FA", "YU13-U", "PC", "YU13--1"),
		new Tier("Must have", "2YJ04"),
		new Tier("Must have", "2YU13"),
		new Tier("Must have", "2(YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ19)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Darius - Wrecking Crew", null, null, false, new Array(new Tier("Only", "YW07 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ11 YJ20 YU03 YU08 YA05 YS01 YS06 YS07 YJ18 YJ19"),
		new Tier("Must have", "2YU08", "free", "YA05"),
		new Tier("Only", "YW07 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ11 YJ19 YJ20 YU03 YU08 YA05 YS01 YS06 YS07", "PC","YJ07--1 YJ08--1 YJ09--1 YJ10--1 YJ12--1 YJ14--1 YJ11--1 YJ19--1"), 
		new Tier("Must have in battlegroup", "YJ11")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Darius - Field Tests (NQ43)", null, null, false, new Array(new Tier("Only", "YW07 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ20 YJ18 YJ19 YU03 YU04 YU13 YU15 YA02 YS06 YS03"),
		new Tier("Must have", "YU13"),
		new Tier("Must have in battlegroup", "YJ20" , "free" , "YS03"), 
		new Tier("Must have", "2(YJ09 YJ12 YJ19 YJ20)")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Kara Sloan - Gunslingers", null, null, false, new Array(new Tier("Only", "YW08 YJ01 YJ03 YJ04 YJ05 YJ07 YJ10 YJ14 YJ15 YJ18 YJ19 YJ20 YJ02 YU01 YA01 YU03 YU02 YA07 YU13 YS01"),
		new Tier("Must have", "2YU02"),
		new Tier("Must have", "YU13"),
		new Tier("Must have", "2(YJ07 YJ10 YJ12 YJ14 YJ19)", "PC","YJ07--1 YJ08--1 YJ09--1 YJ10--1 YJ12--1 YJ14--1 YJ19--1")
		)), cygnarColors, "Cygnar"),
addWMHTierArmy(new Army("Constance Blaize - Knights of the Prophet", null, null, false, new Array(new Tier("Only", "YW09 YJ01 YJ02 YJ03 YJ04 YJ05 YJ07 YJ08 YJ09 YJ10 YJ12 YJ14 YJ15 YJ17 YJ18 YJ19 YJ20 YU03 YU08 YA05 YU12 YA06 YS01 YS09 MS18", "FA", "YU12-U"),
		new Tier("Must have", "2YU12", "free", "YA06"),
		new Tier("Must have", "YS09"),
		new Tier("Must have", "YJ17")
		)), cygnarColors, "Cygnar")

                             
]);
var cygnarCasters = new ArmyGroup("Cygnar Warcasters", cygnarColors);
var cygnarWarjacks = new ArmyGroup("Cygnar Warjacks", cygnarColors);
var cygnarUnits = new ArmyGroup("Cygnar Units", cygnarColors);
var cygnarBattleEngines = new ArmyGroup("Cygnar Battle Engines", cygnarColors);
var cygnarUas = new ArmyGroup("Cygnar Unit Attachments", cygnarColors);
var cygnarSolos = new ArmyGroup("Cygnar Solos", cygnarColors);
var cygnarMercCasters = new ArmyGroup("Mercenary Warcasters", mercColors, null, true);
var cygnarMercWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var cygnarMercUnits = new ArmyGroup("Mercenary Units", mercColors);
var cygnarMercUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var cygnarMercSolos = new ArmyGroup("Mercenary Solos", mercColors);
var cygnarWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
cygnarCasters.models = new Array(getModelById("YW01"),getModelById("YW02"),getModelById("YW03"),getModelById("YW04"),getModelById("YW05"),getModelById("YW06"),getModelById("YW07"),getModelById("YW08"),getModelById("YW09"));
cygnarWarjacks.models = new Array(getModelById("YJ01"),getModelById("YJ02"),getModelById("YJ03"),getModelById("YJ04"),getModelById("YJ05"),getModelById("YJ06"),getModelById("YJ07"),getModelById("YJ08"),getModelById("YJ09"),getModelById("YJ10"),getModelById("YJ11"),getModelById("YJ12"),getModelById("YJ13"),getModelById("YJ14"),getModelById("YJ15"),getModelById("YJ16"),getModelById("YJ17"),getModelById("YJ18"),getModelById("YJ19"),getModelById("YJ20"));
cygnarBattleEngines.models = new Array(getModelById("YE01"));
cygnarUnits.models = new Array(getModelById("YU01"),getModelById("YU02"),getModelById("YU03"),getModelById("YU04"),getModelById("YU05"),getModelById("YU06"),getModelById("YU07"),getModelById("YU08"),getModelById("YU09"),getModelById("YU10"),getModelById("YU11"),getModelById("YU12"),getModelById("YU13"),getModelById("YU14"),getModelById("YU15"));
cygnarUas.models = new Array(getModelById("YA01"),getModelById("YA02"),getModelById("YA03"),getModelById("YA04"),getModelById("YA05"),getModelById("YA06"),getModelById("YA07"),getModelById("YA08"),getModelById("YA09"),getModelById("YA10"));
cygnarSolos.models = new Array(getModelById("YS01"),getModelById("YS02"),getModelById("YS03"),getModelById("YS04"),getModelById("YS05"),getModelById("YS06"),getModelById("YS07"),getModelById("YS08"),getModelById("IS05"),getModelById("YS09"));
cygnarMercCasters.models = new Array(getModelById("MW02"),getModelById("MW03"),getModelById("MW04"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"),getModelById("MW10"));
cygnarMercWarjacks.models = new Array(getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ14"),getModelById("MJ15"),getModelById("MJ16"),getModelById("MJ17"));
cygnarMercUnits.models = new Array(getModelById("MU01"),getModelById("MU02"),getModelById("MU03"),getModelById("MU05"),getModelById("MU06"),getModelById("MU07"),getModelById("MU08"),getModelById("MU09"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU16"),getModelById("MU17"),getModelById("MU18"),getModelById("MU19"));
cygnarMercUas.models = new Array(getModelById("MA01"),getModelById("MA02"),getModelById("MA03"));
cygnarMercSolos.models = new Array(getModelById("IW03"),getModelById("MS01"),getModelById("MS02"),getModelById("MS03"),getModelById("MS04"),getModelById("MS05"),getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS14"),getModelById("MS16"),getModelById("MS17"),getModelById("MS18"),getModelById("MS19"),getModelById("MS20"),getModelById("MS21"),getModelById("MS22"),getModelById("MS23"),getModelById("MS24"),getModelById("IS01"),getModelById("IS03"),getModelById("IS04"));
cygnarWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB06"));
cygnarArmy.groups = new Array(cygnarCasters, cygnarWarjacks, cygnarBattleEngines, cygnarUnits, cygnarUas, cygnarSolos, cygnarMercCasters, cygnarMercWarjacks, cygnarMercUnits, cygnarMercUas, cygnarMercSolos, cygnarWarbeasts);
addArmy(cygnarArmy);

var cryxArmy = new Army("Cryx", null, true, [
addWMHTierArmy(new Army("Asphyxious - Scavengers of the Line", null, null, false, new Array(new Tier("Only", "Cw01 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ06 CJ20 CU01 CA04 CU02 CU03 CA02 CU15 CS02 CS05 CS03 CS04 CS01"),
		new Tier("Must have","3CS03","PC","CJ07--1 CJ14--1"),
		new Tier("Must have in battlegroup","CJ06"),
		new Tier("Must have in battlegroup","3(CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ18)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("epic Asphyxious - Dark Alliance", null, null, false, new Array(new Tier("Only", "Cx01 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ06 CJ12 CJ18 CJ20 CU01 CA04 CU06 CU13 CU14 CU12 CS03 CS04 CS01 CS07"),
		new Tier("Must have","CU12"),
		new Tier("Must have","2CU13","free","CU14"),
		new Tier("Must have in battlegroup","CJ12")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Asphyxious3 - Orchestrations of Annihilation", null, null, false, new Array(new Tier("Only", "Cz01 CJ01 CJ02 CJ03 CJ04 CJ05 CJ06 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ15 CJ16 CJ17 CJ18 CJ20 CE01 CU02 CU03 CA02 CU15 CU08 CU12 CS11 CS01 CS02 CS03 CS05 CS06 CS13","free","CS03"),
		new Tier("Must have","CS06"),
		new Tier("Must have","3(CU02 CU03 CU15 CU08 CU12)"),
		new Tier("Must have","CJ20")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Deneghra - Witching Hour", null, null, false, new Array(new Tier("Only", "Cw02 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ20 CU02 CU03 CA02 CS03 CS04 CS06 CS01 CS11", "FA", "CS11-+1-CJ07|CJ08|CJ09|CJ10|CJ11|CJ14|CJ17|CJ18"),
		new Tier("Must have", "4(CS03 CS04 CS06 CS01 CS11)"),
		new Tier("Must have in battlegroup","5(CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ17)","free","CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ17"),
		new Tier("Must have in battlegroup", "2(CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ18)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("epic Deneghra - Shadow Play", null, null, false, new Array(new Tier("Only", "Cx02 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ20 CJ13 CU06 CU09 CS01 CS05 CS06 CS11"),
		new Tier("Must have", "2(CU06 CU09)", "free", "CS05"),
		new Tier("Must have in battlegroup", "CJ13"),
		new Tier("Must have in battlegroup", "3(CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ13 CJ17 CJ18 CJ20)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Goreshade - Seekers in Darkness", null, null, false, new Array(new Tier("Only", "Cw05 CJ04 CJ10 CJ11 CJ18 CJ20 CU01 CA04 MU05 CS05 CS06 CS07"),
		new Tier("Must have", "2CU01"),
		new Tier("Must have", "MU05"),
		new Tier("Must have in battlegroup", "4CJ04", "free", "CJ04")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("epic Goreshade - Heresy of Shadows", null, null, false, new Array(new Tier("Only", "Cx05 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ20 CU01 CA04 CU06 CU12 CS03 CS04 CS06 CS01 CS07", "FA", "CU01-U"),
		new Tier("Must have", "2CU01", "free", "CA04"),
		new Tier("Must have", "CU12"),
		new Tier("Must have in battlegroup", "3(CJ01 CJ02 CJ03 CJ15)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Skarre - Shore Leave", null, null, false, new Array(new Tier("Only", "Cw03 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ10 CJ11 CJ17 CJ18 CU07 CU10 CU09 CU05 CA06 CU11 CU04 CA03 CU16 CA05 CS03 CS04 CS01 CS12 CS08 CS10"),
		new Tier("Must have", "2(CU04 CU16)"),
		new Tier("Must have in battlegroup", "2(CJ10 CJ11 CJ18)"),
		new Tier("Must have", "2(CU07 CU10)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Skarre - Ships in the Night (NQ37)", null, null, false, new Array(new Tier("Only", "Cw03 CJ01 CJ02 CJ03 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ15 CJ17 CJ18 CJ20 CU07 CU05 CA06 CU11 CU09 CS01 CS11 CS13 MU12 MU13 MA01 MA02 MU14 MJ12 MJ13"),
		new Tier("Must have", "1(CU05 CU09 CU11)"),
		new Tier("Must have", "3(CJ04 CJ17)"),
		new Tier("Must have", "3(MU12 MU13 MU14)", "PC", "MU12--1 MU13--1 MU14--1")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("epic Skarre - Merchants of Death", null, null, false, new Array(new Tier("Only", "Cx03 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ20 CU04 CA03 CU16 CA05 CS12", "FA", "CU04-U CS12-+1-CU04"),
		new Tier("Must have", "2CU04", "free", "CA03"),
		new Tier("Must have", "1CA05"),
		new Tier("Must have in battlegroup", "2(CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ18)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Mortenebra - Infernal Machines", null, null, false, new Array(new Tier("Only", "CW07 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ12 CJ14 CJ17 CJ18 CJ20 CU02 CU03 CA02 CU15 CU08 CS02 CS03 CS04 CS11", "FA", "CS03-+1-CJ07|CJ08|CJ09|CJ10|CJ11|CJ12|CJ14"),
		new Tier("Must have", "2CS11"),
		new Tier("Only", "CW07 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ12 CJ14 CJ17 CJ18 CJ20 CS02 CS03 CS04 CS11", "PC", "CJ07--1 CJ08--1 CJ09--1 CJ10--1 CJ11--1 CJ12--1 CJ14--1 CJ18--1"),
		new Tier("Must have", "4(CJ07 CJ08 CJ09 CJ10 CJ11 CJ12 CJ14 CJ18)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Terminus - The Ghost Fleet", null, null, false, new Array(new Tier("Only", "CW04 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ12 CJ20 CU10 CU08 CU09 CU05 CA06 CU11 CS03 CS04 CS01 CS08 CS09 CS10", "PC", "CU05--1"),
		new Tier("Must have", "CS08"),
		new Tier("Must have", "CU09"),
		new Tier("Must have in battlegroup", "2(CJ10 CJ11 CJ18)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Venethrax - The Dragon Slayers", null, null, false, new Array(new Tier("Only", "CW08 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ20 CU07 CU10 CU03 CA02 CU15 CS06 CS01 CS10", "PC", "CJ09--1"),
		new Tier("Must have", "2(CU07 CU10 CU03 CU15)"),
		new Tier("Must have", "CS10"),
		new Tier("Must have", "2CJ09")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Witch Coven - Auguries of War", null, null, false, new Array(new Tier("Only", "CW06 CJ01 CJ02 CJ03 CJ15 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ17 CJ18 CJ12 CJ20 CU06 CU16 CA05 CU08 CU12 CS03 CS04 CS06 CS01 CS11 CS09", "FA", "CU08-2 CS11-+1-CJ07|CJ08|CJ09|CJ10|CJ11|CJ12|CJ14|CJ17|CJ18"),
		new Tier("Must have", "CS09"),
		new Tier("Must have", "CU12"),
		new Tier("Must have in battlegroup", "3(CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ18 CJ12)")
		)), cryxColors, "Cryx"),
addWMHTierArmy(new Army("Scaverous - Funeral Rites", null, null, false, new Array(new Tier("Only", "CW09 CJ01 CJ02 CJ03 CJ04 CJ05 CJ07 CJ08 CJ09 CJ10 CJ11 CJ14 CJ15 CJ17 CJ18 CJ12 CJ19 CJ20 CU03 CA02 CU15 CU14 CU12 CS03 CS04 CS01 CS11 CS09 CS13 CS05 CS06 CE01"), // TODO for every helljack, one free necrotech
		new Tier("Must have", "CU12"),
		new Tier("Must have", "CE01"),
		new Tier("Must have in battlegroup", "CJ19")
		)), cryxColors, "Cryx")
]);
var cryxCasters = new ArmyGroup("Cryx Warcasters", cryxColors);
var cryxWarjacks = new ArmyGroup("Cryx Warjacks", cryxColors);
var cryxBattleEngines = new ArmyGroup("Cryx Battle Engines", cryxColors);
var cryxUnits = new ArmyGroup("Cryx Units", cryxColors);
var cryxUas = new ArmyGroup("Cryx Unit Attachments", cryxColors);
var cryxSolos = new ArmyGroup("Cryx Solos", cryxColors);
var cryxMercCasters = new ArmyGroup("Mercenary Warcasters", mercColors, null, true);
var cryxMercWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var cryxMercUnits = new ArmyGroup("Mercenary Units", mercColors);
var cryxMercUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var cryxMercSolos = new ArmyGroup("Mercenary Solos", mercColors);
var cryxMercWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
cryxCasters.models = new Array(getModelById("CW01"),getModelById("CW02"),getModelById("CW03"),getModelById("CW04"),getModelById("CW05"),getModelById("CW06"),getModelById("CW07"),getModelById("CW08"),getModelById("CW09"));
cryxWarjacks.models = new Array(getModelById("CJ01"),getModelById("CJ02"),getModelById("CJ03"),getModelById("CJ04"),getModelById("CJ05"),getModelById("CJ06"),getModelById("CJ07"),getModelById("CJ08"),getModelById("CJ09"),getModelById("CJ10"),getModelById("CJ11"),getModelById("CJ12"),getModelById("CJ13"),getModelById("CJ14"),getModelById("CJ15"),getModelById("CJ16"),getModelById("CJ17"),getModelById("CJ18"),getModelById("CJ19"),getModelById("CJ20"));
cryxBattleEngines.models = new Array(getModelById("CE01"));
cryxUnits.models = new Array(getModelById("CU01"),getModelById("CU02"),getModelById("CU03"),getModelById("CU04"),getModelById("CU05"),getModelById("CU06"),getModelById("CU07"),getModelById("CU08"),getModelById("CU09"),getModelById("CU10"),getModelById("CU11"),getModelById("CU12"),getModelById("CU13"),getModelById("CU14"),getModelById("CU15"),getModelById("CU16"));
cryxUas.models = new Array(getModelById("CA02"),getModelById("CA03"),getModelById("CA04"),getModelById("CA05"),getModelById("CA05"),getModelById("CA06"));
cryxSolos.models = new Array(getModelById("CS01"),getModelById("CS02"),getModelById("CS03"),getModelById("CS04"),getModelById("CS05"),getModelById("CS06"),getModelById("CS07"),getModelById("CS08"),getModelById("CS09"),getModelById("CS10"),getModelById("CS11"),getModelById("CS12"),getModelById("CS13"));
cryxMercCasters.models = new Array(getModelById("MW01"),getModelById("MW05"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"));
cryxMercWarjacks.models = new Array(getModelById("MJ01"),getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ16"),getModelById("MJ17"));
cryxMercUnits.models = new Array(getModelById("MU01"),getModelById("MU04"),getModelById("MU05"),getModelById("MU08"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU18"));
cryxMercUas.models = new Array(getModelById("MA01"),getModelById("MA02"));
cryxMercSolos.models = new Array(getModelById("IW03"),getModelById("IW04"),getModelById("MS03"),getModelById("MS05"),getModelById("MS07"),getModelById("MS08"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS15"),getModelById("MS16"),getModelById("MS21"),getModelById("MS22"),getModelById("IS03"),getModelById("IS06"));
cryxMercWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
cryxArmy.groups = new Array(cryxCasters, cryxWarjacks, cryxBattleEngines, cryxUnits, cryxUas, cryxSolos, cryxMercCasters, cryxMercWarjacks, cryxMercUnits, cryxMercUas, cryxMercSolos, cryxMercWarbeasts);
addArmy(cryxArmy);

var menothArmy = new Army("Protectorate of Menoth", null, true, [
addWMHTierArmy(new Army("Kreoss - Interdiction Strike Force", null, null, false, new Array(new Tier("Only", "Pw01 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ13 PJ14 PJ15 PJ17 PJ19 PU01 PU04 PU09 PA04 PU11 PU10 PU14 PS02 PS11 PS12 PS09", "FA", "PU10-2", "PC", "PU10--1"), 
		new Tier("Must have", "PS09"),
		new Tier("Must have", "2PU09"),
		new Tier("Must have", "2(PJ03 PJ09)")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("epic Kreoss - Crusaders of Sul", null, null, false, new Array(new Tier("Only", "Px01 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ13 PJ14 PJ15 PJ17 PJ19 PU06 PU04 PU09 PA04 PU11 PU10 PU14 PU05 PA02 PU07 PA06 PU08 PU12 PS02 PS11 PS12 PS09", "FA", "PU04-U"),
		new Tier("Must have", "2PU04"),
		new Tier("Must have", "4(PU04 PU09 PU11 PU10 PU14)", "free", "PS02 PS11"),
		new Tier("Must have", "PJ13")
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Kreoss3 - Revelarions of the Creator", null, null, false, new Array(new Tier("Only", "Pz01 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ13 PJ14 PJ15 PJ17 PJ19 PE01 PU01 PU04 PU09 PU10 PU11 PU14 PA04 PS09 PS11 PS05 PS12", "FA", "PU10-2"),
		new Tier("Must have", "PU10"),
		new Tier("Must have", "PJ13", "PC", "PJ07--1 PJ12--1 PJ09--1 PJ17--1 PJ14--1 PJ13--1"),
		new Tier("Must have", "PU01")
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Reclaimer - The Flames of Reclamation", null, null, false, new Array(new Tier("Only", "Pw02 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ11 PJ12 PJ14 PJ15 PJ17 PJ19 PU07 PA06 PU03 PA01 PU02 PU06 PS05 PS10 PS12", "FA", "PS05-+1-PU07|PU03|PU02|PU06", "PC", "PJ12--1"),
		new Tier("Must have", "3PS05"),
		new Tier("Must have", "2PU07"),
		new Tier("Must have in battlegroup", "2(PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ17)")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Testament - Sands of Fate", null, null, false, new Array(new Tier("Only", "Px02 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ11 PJ12 PJ14 PJ15 PJ17 PJ19 PU09 PA04 PU03 PA01 PU13 PA03 PS11 PS05 PS10"),
		new Tier("Must have", "2PU09"),
		new Tier("Must have", "2PU13", "PC", "PU13--1"),
		new Tier("Must have", "PJ11")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Severius - Legions of Faith", null, null, false, new Array(new Tier("Only", "Pw03 PJ01 PJ02 PJ03 PJ04 PJ05 PJ06 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU03 PA01 PU05 PA02 PU02 PU06 PS08 PS03 PS02 PS09 PS11 PS10 PS12"),
		new Tier("Must have", "2PU05", "free", "PA02"),
		new Tier("Must have", "2PS12"),
		new Tier("Must have", "PJ06")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("epic Serverius - The Northern Crusade", null, null, false, new Array(new Tier("Only", "Px03 PJ01 PJ02 PJ03 PJ04 PJ05 PJ06 PJ07 PJ08 PJ09 PJ10 PJ11 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU05 PA02 PU04 PU09 PA04 PU11 PU10 PU14 PS08 PS03 PS02 PS09 PS11 PS10 PS12 PS04", "PC", "PJ07--1 PJ14--1"),
		new Tier("Must have", "PS04"),
		new Tier("Must have", "2(PU11 PU14)"),
		new Tier("Must have", "3(PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ17)")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Feora - New Model Army", null, null, false, new Array(new Tier("Only", "Pw04 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU08 PU05 PA02 PU07 PA06 PS12", "FA", "PU08-U PU05-U PU07-U", "PC", "PJ09--1"),
		new Tier("Must have", "2(PU05 PU07 PU08)"),
		new Tier("Must have", "2PU08"),
		new Tier("Must have", "3(PJ02 PJ12 PJ08 PJ19)")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("epic Feora - Defenders of the Temple", null, null, false, new Array(new Tier("Only", "Px04 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU05 PA02 PU07 PA06 PU08 PU12 PS12", "FA", "PU05-U PU07-U PU08-U"),
		new Tier("Must have", "2PU05", "free", "PA02"),
		new Tier("Must have", "PU07 PU08"),
		new Tier("Must have", "PU12")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Amon - Wanderers of the Faith", null, null, false, new Array(new Tier("Only", "PW05 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ17 PJ19 PU03 PA01 PU13 PA03 PS03 PS05 PS07 PS10 PS12", "FA", "PU13-U PS07-+1-PU03|PU13"),
		new Tier("Must have", "2PU13", "free", "PA03"),
		new Tier("Must have", "3PS07"),
		new Tier("Only in battlegroup", "PJ01 PJ02 PJ03 PJ04 PJ05 PJ15")  
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Harbinger - Army of the Righteous", null, null, false, new Array(new Tier("Only", "PW06 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ11 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU03 PA01 PU05 PA02 PS08 PS01 PS06 PS12", "FA", "PS01-+1-PU01|PU03|PU05"),
		new Tier("Must have", "PJ11"),
		new Tier("Must have", "PS06"),
		new Tier("Must have in battlegroup", "3(PJ07 PJ09 PJ12 PJ14 PJ17 PJ15)", "PC", "PJ07--1 PJ09--1 PJ11--1 PJ12--1 PJ14--1 PJ17--1 PJ15--1")
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Reznik - Judgment of Fire", null, null, false, new Array(new Tier("Only", "PW07 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ16 PJ17 PJ19 PU01 PU07 PA06 PU14 PS05 PS08 PS03 PS10 PS12", "PC", "PJ10--1"),
		new Tier("Must have", "2PU07"),
		new Tier("Must have", "3(PU01 PU07 PU14)", "free", "PS03"),
		new Tier("Must have", "2(PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ16 PJ17)")
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Reznik - Knocking on Heavens Door (NQ35)", null, null, false, new Array(new Tier("Only", "PW07 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ16 PJ17 PJ19 PU01 PU07 PA06 PU02 PU06 MU08 PA05 MU15 MU18 PS10 PS12 PS03 MS06 MS16 PE01"),
		new Tier("Must have", "1(MU08 MU18)", "free", "PA05"),  // todo for each
		new Tier("Must have", "2(PS10 PS12)"),
		new Tier("Must have", "3(PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ16 PJ17)")
		)), menothColors, "Menoth"),
addWMHTierArmy(new Army("Vindictus - Missionaries of War", null, null, false, new Array(new Tier("Only", "PW08 PJ01 PJ02 PJ03 PJ04 PJ05 PJ07 PJ08 PJ09 PJ10 PJ12 PJ14 PJ15 PJ17 PJ19 PU01 PU09 PA04 PU03 PA01 PS07 PS11 PS08 PS05 PS12"),
		new Tier("Must have", "2PU09", "free", "PA04"),
		new Tier("Only", "PW08 PJ01 PJ02 PJ03 PJ04 PJ05 PJ10 PJ12 PJ15 PJ17 PU01 PU09 PA04 PU03 PA01 PS07 PS11 PS08 PS05 PS12"),
		new Tier("Must have", "3(PJ10 PJ12 PJ17)")
		)), menothColors, "Menoth"),		
addWMHTierArmy(new Army("Thyra - Black Widows", null, null, false, new Array(new Tier("Only", "PW09 PJ05 PJ04 PJ01 PJ02 PJ03 PJ15 PJ12 PJ10 PJ17 PJ18 PU01 PU08 PS13", "FA", "PU08-U"),
		new Tier("Must have", "2PU08"),
		new Tier("Must have", "PS13"),
		new Tier("Must have", "PJ18")
		)), menothColors, "Menoth")		
]);
var menothCasters = new ArmyGroup("Menoth Warcasters", menothColors);
var menothWarjacks = new ArmyGroup("Menoth Warjacks", menothColors);
var menothBattleEngines = new ArmyGroup("Menoth Battle Engines", menothColors);
var menothUnits = new ArmyGroup("Menoth Units", menothColors);
var menothUas = new ArmyGroup("Menoth Unit Attachments", menothColors);
var menothSolos = new ArmyGroup("Menoth Solos", menothColors);
var menothMercCasters = new ArmyGroup("Mercenary Warcasters", mercColors, null, true);
var menothMercWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var menothMercUnits = new ArmyGroup("Mercenary Units", mercColors);
var menothMercUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var menothMercSolos = new ArmyGroup("Mercenary Solos", mercColors);
var menothMercWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
menothCasters.models = new Array(getModelById("PW01"),getModelById("PW02"),getModelById("PW03"),getModelById("PW04"),getModelById("PW05"),getModelById("PW06"),getModelById("PW07"),getModelById("PW08"),getModelById("PW09"));
menothWarjacks.models = new Array(getModelById("PJ01"),getModelById("PJ02"),getModelById("PJ03"),getModelById("PJ04"),getModelById("PJ05"),getModelById("PJ06"),getModelById("PJ07"),getModelById("PJ08"),getModelById("PJ09"),getModelById("PJ10"),getModelById("PJ11"),getModelById("PJ12"),getModelById("PJ13"),getModelById("PJ14"),getModelById("PJ15"),getModelById("PJ16"),getModelById("PJ17"),getModelById("PJ18"),getModelById("PJ19"));
menothBattleEngines.models = new Array(getModelById("PE01"));
menothUnits.models = new Array(getModelById("PU01"),getModelById("PU02"),getModelById("PU03"),getModelById("PU04"),getModelById("PU05"),getModelById("PU06"),getModelById("PU07"),getModelById("PU08"),getModelById("PU09"),getModelById("PU10"),getModelById("PU11"),getModelById("PU12"),getModelById("PU13"),getModelById("PU14"));
menothUas.models = new Array(getModelById("PA01"),getModelById("PA02"),getModelById("PA03"),getModelById("PA04"),getModelById("PA05"),getModelById("PA06"));
menothSolos.models = new Array(getModelById("PS01"),getModelById("PS02"),getModelById("PS03"),getModelById("PS04"),getModelById("PS05"),getModelById("PS06"),getModelById("PS07"),getModelById("PS08"),getModelById("PS09"),getModelById("PS10"),getModelById("PS11"),getModelById("PS12"),getModelById("PS13"));
menothMercCasters.models = new Array(getModelById("MW01"),getModelById("MW03"),getModelById("MW04"),getModelById("MW05"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"),getModelById("MW10"));
menothMercWarjacks.models = new Array(getModelById("MJ01"),getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ14"),getModelById("MJ15"),getModelById("MJ16"),getModelById("MJ17"));
menothMercUnits.models = new Array(getModelById("MU02"),getModelById("MU03"),getModelById("MU04"),getModelById("MU07"),getModelById("MU08"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU16"),getModelById("MU17"),getModelById("MU18"),getModelById("MU19"));
menothMercUas.models = new Array(getModelById("MA01"),getModelById("MA02"));
menothMercSolos.models = new Array(getModelById("IW03"),getModelById("MS01"),getModelById("MS03"),getModelById("MS04"),getModelById("MS06"),getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS14"),getModelById("MS15"),getModelById("MS16"),getModelById("MS19"),getModelById("MS20"),getModelById("MS21"),getModelById("IS01"),getModelById("IS06"));
menothMercWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB06"));
menothArmy.groups = new Array(menothCasters, menothWarjacks, menothBattleEngines, menothUnits, menothUas, menothSolos, menothMercCasters, menothMercWarjacks, menothMercUnits, menothMercUas, menothMercSolos, menothMercWarbeasts);
addArmy(menothArmy);

var khadorArmy = new Army("Khador", null, true,[
addWMHTierArmy(new Army("Sorscha - Mechanized Infantry", null, null, false, new Array(new Tier("Only", "Kw02 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ09 KJ11 KJ13 KJ15 KU01 KA08 KU05 KU06 KA02 KA03 KU17 KU09 KU13 KS10 KS03"),
		new Tier("Must have", "3(KU06 KU17 KU09 KU13)", "free", "KS03"),
		new Tier("Must have", "KJ09"),
		new Tier("Must have", "3(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ09 KJ11 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Sorscha - 5th Border Legion", null, null, false, new Array(new Tier("Only", "Kx02 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ09 KJ11 KJ13 KJ15 KU01 KA08 KU05 KU04 KU12 KU16 KU06 KA02 KA03 KU17 KU09 KU13 KS01 KS02 KS03 KS04 KS10", "PC", "KJ06--1"), 
		new Tier("Must have", "2KU06"),
		new Tier("Must have", "2(KU04 KU12 KU16)"),
		new Tier("Must have", "2KJ06")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Sorscha - Full Assault (NQ43)", null, null, false, new Array(new Tier("Only", "Kx02 KJ01 KJ08 KJ11 KJ13 KJ15 KU01 KU06 KU09 KU13 KU17 KU11 KA02 KA03 KA08 KE01 KS01 KS10", "FA", "KU09-3"), 
		new Tier("Must have in battlegroup", "KJ15", "PC" , "KJ01--1 KJ08--1 KJ11--1 KJ13--1 KJ15--1"),
		new Tier("Must have", "2(KU09)"),
		new Tier("Must have in battlegroup", "2(KJ01 KJ08 KJ11 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Butcher - Heart of Darkness", null, null, false, new Array(new Tier("Only", "Kw01 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15 KU08 KU05 KU04 KU12 KU16 KU06 KA02 KA03 KS01 KS08 KS10 KS09 KS02 KS04", "FA", "KS01-+1-KU08|KU05|KU04|KU12|KU16|KU06", "PC", "KU04--1"),
		new Tier("Must have", "2(KU04 KU12 KU16)"),
		new Tier("Must have", "4(KS01 KS08 KS10 KS09 KS02 KS04)"),
		new Tier("Must have in battlegroup", "3(KJ02 KJ03 KJ04 KJ05 KJ06)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Butcher - Claws of the Dragon (NQ41)", null, null, false, new Array(new Tier("Only", "Kw01 KJ03 KJ04 KJ05 KJ06 KU01 KU03 KU11 KA01 KA09 KS01 KS08" ),
		new Tier("Must have", "KS08"),
		new Tier("Must have", "2(KU03)" , "free" , "KA09"),
		new Tier("Must have in battlegroup", "2(KJ02 KJ03 KJ04 KJ05 KJ06)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Butcher - Mad Dogs of War", null, null, false, new Array(new Tier("Only", "Kx01 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15 KU02 KA06 KS01 KS08 KS09 KS05", "FA", "KU02-U KA06-U"),
		new Tier("Must have", "3(KU02)", "PC", "KU02--1"),
		new Tier("Must have", "KS05"),
		new Tier("Must have in battlegroup", "2(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Vladimir - War Host", null, null, false, new Array(new Tier("Only", "Kw03 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ10 KJ11 KJ13 KJ15 KU01 KA08 KU07 KU03 KA01 KA09 KU11 KU14 KS08 KS06", "PC", "KJ04--1", "FA", "KS06-+1-KU07"),
		new Tier("Must have", "2KU03"),
		new Tier("Must have", "3KS06"),
		new Tier("Only in battlegroup", "KJ04 KJ10")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Vladimir - Blood of Heroes", null, null, false, new Array(new Tier("Only", "Kx03 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ10 KJ11 KJ13 KJ15 KU08 KU05 KU03 KA01 KA09 KU11 KU14 KS07 KS08", "FA", "KU11-2", "PC", "KU11--1"),
		new Tier("Must have", "KU14"),
		new Tier("Must have in battlegroup", "KJ10"),
		new Tier("Must have", "KS07 KU11")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Vlad3 - Charge of the Horselord", null, null, false, new Array(new Tier("Only", "Kz03 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15 KJ10 KE01 KU01 KU11 KS08 KS05 KS04 KS06 KS07", "FA" , "KU11-2 KS04-2 KE01-3") ,
		new Tier("Must have", "2(KU11)"),
		new Tier("Must have", "2(KS05 KS04 KS06 KS07)"),
		new Tier("Must have in battlegroup", "KJ10", "PC", "KJ01--1 KJ02--1 KJ03--1 KJ04--1 KJ05--1 KJ06--1 KJ08--1 KJ11--1 KJ13--1 KJ15--1 KJ10--1 KJ15--1")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Irusk - Advance Assualt Force", null, null, false, new Array(new Tier("Only", "Kw04 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ11 KJ13 KJ15 KU01 KA08 KU10 KA05 KU03 KA01 KA09 KU11 KU14 KU04 KU12 KU16 KS02 KS04 KS07 KS08", "PC", "KJ05--1 KJ08--1"),
		new Tier("Must have", "2KU03"),
		new Tier("Must have", "2(KU04 KU12 KU16)"),
		new Tier("Must have", "2(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ11 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Irusk - The Art of War", null, null, false, new Array(new Tier("Only", "Kx04 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ11 KJ13 KJ15 KU01 KA08 KU04 KU06 KA02 KA03 KU17 KU09 KU13 KU15 KU18 KA04 KS03 KS10", "FA", "KU15-U KU09-+1-KU06|KU17 KU13-+1-KU06|KU17"),
		new Tier("Must have", "2KU06", "free", "KA02"),
		new Tier("Must have", "2KU15"),
		new Tier("Must have", "KJ07")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("epic Irusk - Heavy Armor Battalion (NQ39)", null, null, false, new Array(new Tier("Only", "Kx04 KJ02 KJ05 KJ06 KJ07 KJ09 KJ12 KJ13 KJ14 KJ15 KE01 KU01 KU03 KU04 KU09 KU11 KU12 KU13 KU16 KA01 KA09 KA08 KS02 KS04", "FA" , "KU01-4 KA08-3"),
		new Tier("Must have", "2(KU01)"),
		new Tier("Must have", "KE01" , "PC" , "KE01--1"),
		new Tier("Must have", "2(KJ02 KJ05 KJ06 KJ07 KJ09 KJ12 KJ13 KJ14 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Karchev - Iron Curtain", null, null, false, new Array(new Tier("Only", "KW05 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ11 KJ13 KJ15 KU01 KA08 KU07 KU04 KU12 KU16 KS02 KS04 KS06", "FA", "KU07-U KS06-+1-KU07"),
		new Tier("Must have", "2(KU04 KU12 KU16)"),
		new Tier("Must have", "1KU07"),
		new Tier("Must have", "3(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ07 KJ08 KJ11 KJ13 KJ15)", "PC", "KJ01--1 KJ02--1 KJ03--1 KJ04--1 KJ05--1 KJ06--1 KJ07--1 KJ08--1 KJ11--1 KJ13--1 KJ15--1")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Old Witch - The Invisible Army", null, null, false, new Array(
		new Tier("Only", "KW07 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15 KU01 KA08 KU07 KU08 KU05 KS01 KS09 KS10"),
		new Tier("Must have", "2KU08", "free", "KS09"),
		new Tier("Must have", "2KU07"),
		new Tier("Must have", "2(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Zerkova - Wolves of the Winter", null, null, false, new Array(new Tier("Only", "KW06 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15 KU01 KA08 KU02 KA06 KU07 KS01 KS05 KS06", "FA", "KU07-U KS06-U"),
		new Tier("Must have", "2KU02", "free", "KA06"), 
		new Tier("Must have", "2KS06"),
		new Tier("Must have in battlegroup", "3(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Zerkova - Hunting Wolves (NQ34)", null, null, false, new Array(new Tier("Only", "Ky06 KJ01 KJ03 KJ08 KJ11 KJ13 KJ15 MJ03 KU07 KU15 KU18 KA04 KU05 MS03 KS06 KS10", "FA", "KU07-4 KU15-3 KA04-2 KU18-3"),
		new Tier("Must have", "MS03 KU07"), 
		new Tier("Must have", "KU15"),
		new Tier("Must have in battlegroup", "3(KJ01 KJ03 KJ08 KJ11 KJ13 MJ03 KJ15)", "PC", "KJ01--1 KJ03--1 KJ04--1 KJ08--1 KJ11--1 KJ13--1 MJ03--1 KJ15--1")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Strakhov - Black Operations", null, null, false, new Array(new Tier("Only", "KW08 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ12 KJ13 KJ15 KU10 KA05 KU15 KA04 KU05 KU08 KS01 KS08 KS10", "FA", "KU10-U"),
		new Tier("Must have", "2KU10"),
		new Tier("Must have", "4(KU10 KU15 KU05 KU08)", "free", "KS01 KS10"),
		new Tier("Must have", "2(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ12 KJ13 KJ15)")
		)), khadorColors, "Khador"),
addWMHTierArmy(new Army("Harkevich - Wolf Pack", null, null, false, new Array(new Tier("Only", "KW09 KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ14 KJ15 KU01 KA08 KU04 KU12 KU16 KU06 KA02 KA03 KU09 KU13 KU17 KS08 KS02 KS04 KS10 KS03"),
		new Tier("Must have in battlegroup", "KJ14"),
		new Tier("Must have", "2(KU09 KU13)"),
		new Tier("Must have in battlegroup", "3(KJ01 KJ02 KJ03 KJ04 KJ05 KJ06 KJ08 KJ11 KJ13 KJ14 KJ15)", "PC", "KJ01--1 KJ08--1 KJ11--1 KJ13--1 KJ14--1 KJ15--1")
		)), khadorColors, "Khador")

                
]);
var khadorCasters = new ArmyGroup("Khador Warcasters", khadorColors);
var khadorWarjacks = new ArmyGroup("Khador Warjacks", khadorColors);
var khadorBattleEngines = new ArmyGroup("Khador Battle Engines", khadorColors);
var khadorUnits = new ArmyGroup("Khador Units", khadorColors);
var khadorUas = new ArmyGroup("Khador Unit Attachments", khadorColors);
var khadorSolos = new ArmyGroup("Khador Solos", khadorColors);
var khadorMercCasters = new ArmyGroup("Mercenary Warcasters", mercColors, null, true);
var khadorMercWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var khadorMercUnits = new ArmyGroup("Mercenary Units", mercColors);
var khadorMercUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var khadorMercSolos = new ArmyGroup("Mercenary Solos", mercColors);
var khadorMercWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
khadorCasters.models = new Array(getModelById("KW01"),getModelById("KW02"),getModelById("KW03"),getModelById("KW04"),getModelById("KW05"),getModelById("KW06"),getModelById("KW07"),getModelById("KW08"),getModelById("KW09"));
khadorWarjacks.models = new Array(getModelById("KJ01"),getModelById("KJ02"),getModelById("KJ03"),getModelById("KJ04"),getModelById("KJ05"),getModelById("KJ06"),getModelById("KJ07"),getModelById("KJ08"),getModelById("KJ09"),getModelById("KJ10"),getModelById("KJ11"),getModelById("KJ12"),getModelById("KJ13"),getModelById("KJ14"),getModelById("KJ15"));
khadorUnits.models = new Array(getModelById("KU01"),getModelById("KU02"),getModelById("KU03"),getModelById("KU04"),getModelById("KU05"),getModelById("KU06"),getModelById("KU07"),getModelById("KU08"),getModelById("KU09"),getModelById("KU10"),getModelById("KU11"),getModelById("KU12"),getModelById("KU13"),getModelById("KU14"),getModelById("KU15"),getModelById("KU16"),getModelById("KU17"),getModelById("KU18"));
khadorBattleEngines.models = new Array(getModelById("KE01"));
khadorUas.models = new Array(getModelById("KA01"),getModelById("KA02"),getModelById("KA03"),getModelById("KA04"),getModelById("KA05"),getModelById("KA06"),getModelById("KA07"),getModelById("KA08"),getModelById("KA09"));
khadorSolos.models = new Array(getModelById("KS01"),getModelById("KS02"),getModelById("KS03"),getModelById("KS04"),getModelById("KS05"),getModelById("KS06"),getModelById("KS07"),getModelById("KS08"),getModelById("KS09"),getModelById("KS10"));
khadorMercCasters.models = new Array(getModelById("MW01"),getModelById("MW02"),getModelById("MW03"),getModelById("MW05"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"),getModelById("MW10"));
khadorMercWarjacks.models = new Array(getModelById("MJ01"),getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ14"),getModelById("MJ15"),getModelById("MJ16"),getModelById("MJ17"));
khadorMercUnits.models = new Array(getModelById("MU01"),getModelById("MU02"),getModelById("MU04"),getModelById("MU05"),getModelById("MU06"),getModelById("MU08"),getModelById("MU09"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU16"),getModelById("MU18"));
khadorMercUas.models = new Array(getModelById("MA01"),getModelById("MA02"),getModelById("MA03"));
khadorMercSolos.models = new Array(getModelById("IW03"),getModelById("MS01"),getModelById("MS02"),getModelById("MS03"),getModelById("MS05"),getModelById("MS06"),getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS15"),getModelById("MS16"),getModelById("MS17"),getModelById("MS18"),getModelById("MS20"),getModelById("MS21"),getModelById("MS22"),getModelById("MS23"),getModelById("MS24"),getModelById("IS01"),getModelById("IS03"),getModelById("IS06"));
khadorMercWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB06"));
khadorArmy.groups = new Array(khadorCasters, khadorWarjacks, khadorBattleEngines, khadorUnits, khadorUas, khadorSolos, khadorMercCasters, khadorMercWarjacks,khadorMercUnits, khadorMercUas, khadorMercSolos, khadorMercWarbeasts);
addArmy(khadorArmy);

var retributionArmy = new Army("Retribution of Scyrah", null, true, [
addWMHTierArmy(new Army("Rahn - Charge of the Battle Mages", null, null, false, new Array(new Tier("Only", "RW01 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ07 RJ08 RJ09 RJ10 RJ11 RJ13 RU03 RU04 RU07 RU09 RA04 RA05 RA06 RS01 RS04", "FA", "RU03-U RS04-+1-RU03"),
		new Tier("Must have", "2(RJ04 RJ05 RJ06 RJ07 RJ09 RJ10 RJ11)", "free", "RS01"),
		new Tier("Must have", "3RS04"),
		new Tier("Must have", "4RU03")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("Vyros - Legions of the Dawn", null, null, false, new Array(new Tier("Only", "Rw02 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13 RU01 RU02 RU06 RU08 RA01 RA02 RA04 RS01 RS02 RS08", "FA", "RU01-U RU02-U RS02-+1-RU01|RU02"),
		new Tier("Must have", "2RU02", "free", "RA02"),
		new Tier("Must have", "RU06 RS08"),
		new Tier("Must have in battlegroup", "2(RJ04 RJ05 RJ06 RJ09 RJ10 RJ11)")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("Vyros - Dawn's Talon (NQ35)", null, null, false, new Array(new Tier("Only", "Rw02 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ13 RU01 RA01 RU02 RA02 RU04 RA06 RU07 RA05 RA04 RU09 RS01 RS02 RS08", "FA", "RU01-3 RU02-3 RS08-3 RS02-3"),
		new Tier("Must have in battlegroup", "2(RJ04 RJ05 RJ06 RJ09 RJ10 RJ11)", "PC", "RJ04--1 RJ05--1 RJ06--1 RJ09--1 RJ10--1 RJ11--1"),
		new Tier("Must have", "2(RU01 RU02 RU04 RU07 RU09)"),
		new Tier("Must have", "4(RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13)")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("epic Vyros - Legions of the Dawn", null, null, false, new Array(new Tier("Only", "Rx02 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ13 RU01 RU02 RU06 RU08 RA01 RA02 RA04 RS01 RS02 RS08", "FA", "RU06-U" , "PC" , "RU06--1"),
		new Tier("Must have", "RU02"),
		new Tier("Must have", "RS08"),
		new Tier("Must have in battlegroup", "2(RJ04 RJ05 RJ06 RJ09 RJ10 RJ11)")
		)), retributionColors, "Retribution"),            
addWMHTierArmy(new Army("Garryth - Assassins", null, null, false, new Array(new Tier("Only", "RW03 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13 RU05 RA03 RA04 MS01 RS05 RS07", "FA", "RU05-U RS05-+1-RU05"),
		new Tier("Must have", "3RS05"),
		new Tier("Must have", "3RU05-RA04", "free", "RS07"),
		new Tier("Only in battlegroup", "RJ01 RJ02 RJ03 RJ08")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("Kaelyssa - Shadows of Retribution", null, null, false, new Array(new Tier("Only", "RW04 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13 RU05 RA03 RA04 MS01 RS01 RS03 RS05 RS06 RS07", "FA", "RU05-U"),
		new Tier("Must have", "2RU05", "free", "RA03"),
		new Tier("Must have", "4(RS05 RS06 MS01)"),
		new Tier("Must have", "3(RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13)")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("Ravyn - Will of the Nine Voices", null, null, false, new Array(new Tier("Only", "RW05 RJ01 RJ02 RJ03 RJ04 RJ05 RJ06 RJ08 RJ09 RJ10 RJ11 RJ13 RU01 RA01 RU08 RA04 RU05 RA03 RS05 RS06 RS07 RS10 MS01", "FA", "RU05-U RA03-U"),
		new Tier("Must have", "3RU05", "free", "MS01 RS05 RS06 RS07"),
		new Tier("Must have", "RS06 RS10"),
		new Tier("Must have", "2RJ06")
		)), retributionColors, "Retribution"),
addWMHTierArmy(new Army("Ossyan - The Hour of War", null, null, false, new Array(new Tier("Only", "RW06 RJ09 RJ10 RJ11 RJ12 RU08 RU04 RA06 RU07 RA05 RA04 RU09 RS01 RS03 MS23 RE01", "FA", "RS01-+1-RJ09|RJ10|RJ11|RJ12"),
		new Tier("Must have", "2RU04", "free", "RA06"),
		new Tier("Must have", "2(RS01)"),
		new Tier("Must have", "RJ12")
		)), retributionColors, "Retribution")
]);
var retributionCasters = new ArmyGroup("Retribution Warcasters", retributionColors);
var retributionWarjacks = new ArmyGroup("Retribution Warjacks", retributionColors);
var retributionUnits = new ArmyGroup("Retribution Units", retributionColors);
var retributionBattleEngines = new ArmyGroup("Retribution Battle Engines", retributionColors);
var retributionUas = new ArmyGroup("Retribution Unit Attachments", retributionColors);
var retributionSolos = new ArmyGroup("Retribution Solos", retributionColors);
var retributionMercUnits = new ArmyGroup("Mercenary Units", mercColors);
var retributionMercSolos = new ArmyGroup("Mercenary Solos", mercColors);
retributionCasters.models = new Array(getModelById("RW01"),getModelById("RW02"),getModelById("RW03"),getModelById("RW04"),getModelById("RW05"),getModelById("RW06"));
retributionWarjacks.models = new Array(getModelById("RJ01"),getModelById("RJ02"),getModelById("RJ03"),getModelById("RJ04"),getModelById("RJ05"),getModelById("RJ06"),getModelById("RJ07"),getModelById("RJ08"),getModelById("RJ09"),getModelById("RJ10"),getModelById("RJ11"),getModelById("RJ12"),getModelById("RJ13"));
retributionUnits.models = new Array(getModelById("RU01"),getModelById("RU02"),getModelById("RU03"),getModelById("RU04"),getModelById("RU05"),getModelById("RU06"),getModelById("RU07"),getModelById("RU08"),getModelById("RU09"));
retributionBattleEngines.models = new Array(getModelById("RE01"));
retributionUas.models = new Array(getModelById("RA01"),getModelById("RA02"),getModelById("RA03"),getModelById("RA04"),getModelById("RA05"),getModelById("RA06"));
retributionSolos.models = new Array(getModelById("RS01"),getModelById("RS02"),getModelById("MS01"),getModelById("RS03"),getModelById("RS04"),getModelById("RS05"),getModelById("RS06"),getModelById("RS07"),getModelById("RS08"),getModelById("RS10"),getModelById("RS11"),getModelById("MS23"));
retributionMercUnits.models = new Array(getModelById("MU05"),getModelById("MU11"));
retributionMercSolos.models = new Array(getModelById("IW02"),getModelById("MS21"),getModelById("IS04"));
retributionArmy.groups = new Array(retributionCasters, retributionWarjacks, retributionBattleEngines, retributionUnits, retributionUas, retributionSolos, retributionMercUnits, retributionMercSolos);
addArmy(retributionArmy);

// All Rhulic stuff
var rhulicArmy = new Army("Searforge Commission", "+1FA");
var rhulicCasters = new ArmyGroup("Rhulic Warcasters", mercColors);
var rhulicWarjacks = new ArmyGroup("Rhulic Warjacks", mercColors);
var rhulicUnits = new ArmyGroup("Rhulic Units", mercColors);
var rhulicUas = new ArmyGroup("Rhulic Unit Attachments", mercColors);
var rhulicSolos = new ArmyGroup("Rhulic Solos", mercColors);
rhulicCasters.models = new Array(getModelById("MW02"),getModelById("MW03"),getModelById("MW10"));
rhulicWarjacks.models = new Array(getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ14"),getModelById("MJ15"));
rhulicUnits.models = new Array(getModelById("MU02"),getModelById("MU06"),getModelById("MU07"),getModelById("MU17"),getModelById("MU19"));
rhulicUas.models = new Array(getModelById("MA03"));
rhulicSolos.models = new Array(getModelById("IW01"),getModelById("MS05"),getModelById("MS12"),getModelById("MS17"),getModelById("IS03"));
rhulicArmy.groups = new Array(rhulicCasters, rhulicWarjacks, rhulicUnits, rhulicUas, rhulicSolos);
addArmy(rhulicArmy);

// CK + Sam + Rhupert
var fourStarArmy = new Army("Four Star Syndicate");
var fourStarCasters = new ArmyGroup("Mercenary Warcasters", mercColors);
var fourStarWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var fourStarUnits = new ArmyGroup("Mercenary Units", mercColors);
var fourStarUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var fourStarSolos = new ArmyGroup("Mercenary Solos", mercColors);
var fourStarWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
fourStarCasters.models = new Array(getModelById("MW01"),getModelById("MW02"),getModelById("MW03"),getModelById("MW05"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"),getModelById("MW10"));
fourStarWarjacks.models = new Array(getModelById("MJ01"),getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ14"),getModelById("MJ15"),getModelById("MJ16"),getModelById("MJ17"),getModelById("MJ18"));
fourStarUnits.models = new Array(getModelById("MU01"),getModelById("MU02"),getModelById("MU03"),getModelById("MU04"),getModelById("MU05"),getModelById("MU06"),getModelById("MU08"),getModelById("MU09"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU16"),getModelById("KU15"),getModelById("MU18"),getModelById("KU18"));
fourStarUas.models = new Array(getModelById("MA01"),getModelById("MA02"),getModelById("KA04"),getModelById("MA03"));
fourStarSolos.models = new Array(getModelById("IW03"),getModelById("IW04"),getModelById("MS01"),getModelById("MS02"),getModelById("MS03"),getModelById("MS04"),getModelById("MS05"),getModelById("MS06"),getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS15"),getModelById("MS16"),getModelById("MS17"),getModelById("MS18"),getModelById("MS20"),getModelById("MS21"),getModelById("MS23"),getModelById("MS24"),getModelById("IS01"),getModelById("IS03"),getModelById("IS06"),getModelById("MS22"));
fourStarWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
fourStarArmy.groups = new Array(fourStarCasters, fourStarWarjacks, fourStarUnits, fourStarUas, fourStarSolos, fourStarWarbeasts);
addArmy(fourStarArmy);

// Y + few cynar units
var highbornArmy = new Army("Highborn Covenant");
var highbornCasters = new ArmyGroup("Mercenary Warcasters", mercColors);
var highbornWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var highbornUnits = new ArmyGroup("Mercenary Units", mercColors);
var highbornUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var highbornSpecial = new ArmyGroup("Special Units", cygnarColors, 1);
var highbornSpecialUA = new ArmyGroup("Special Units Attachments", cygnarColors);
var highbornSolos = new ArmyGroup("Mercenary Solos", mercColors);
var highbornWarbeasts = new ArmyGroup("Mercenary Warbeasts", mercColors);
highbornCasters.models = new Array(getModelById("MW02"),getModelById("MW03"),getModelById("MW04"),getModelById("MW05"),getModelById("MW06"),getModelById("MW08"),getModelById("MW09"),getModelById("MW10"),getModelById("YX09"));
highbornWarjacks.models = new Array(getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ05"),getModelById("MJ06"),getModelById("MJ07"),getModelById("MJ08"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ14"),getModelById("MJ15"),getModelById("MJ16"),getModelById("MJ17"),getModelById("MJ18"),getModelById("YJ17"));
highbornUnits.models = new Array(getModelById("MU01"),getModelById("MU02"),getModelById("MU03"),getModelById("MU05"),getModelById("MU06"),getModelById("MU07"),getModelById("MU08"),getModelById("MU09"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"),getModelById("MU15"),getModelById("MU16"),getModelById("YU12"),getModelById("MU17"),getModelById("MU18"),getModelById("MU19"));
highbornUas.models = new Array(getModelById("MA01"),getModelById("MA02"),getModelById("YA06"),getModelById("MA03"));
highbornSolos.models = new Array(getModelById("IW03"),getModelById("MS01"),getModelById("MS02"),getModelById("MS03"),getModelById("MS04"),getModelById("MS05"),getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"),getModelById("MS14"),getModelById("MS16"),getModelById("MS17"),getModelById("MS18"),getModelById("MS19"),getModelById("MS20"),getModelById("MS21"),getModelById("MS22"),getModelById("MS23"),getModelById("MS24"),getModelById("IS01"),getModelById("IS03"),getModelById("IS04"),getModelById("IS05"));
highbornWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB06"));
highbornSpecial.models = new Array(getModelById("YU01"), getModelById("YU02"));
highbornSpecialUA.models = new Array(getModelById("Ya01"), getModelById("YA07"));
highbornArmy.groups = new Array(highbornCasters, highbornWarjacks, highbornUnits, highbornUas, highbornSpecial, highbornSpecialUA, highbornSolos, highbornWarbeasts);
addArmy(highbornArmy);

// Shae, Privateers, all merc jacks
var talionArmy = new Army("Talion Charter");
var talionCasters = new ArmyGroup("Mercenary Warcasters", mercColors);
var talionWarjacks = new ArmyGroup("Mercenary Warjacks", mercColors);
var talionUnits = new ArmyGroup("Mercenary Units", mercColors);
var talionUas = new ArmyGroup("Mercenary Unit Attachments", mercColors);
var talionSolos = new ArmyGroup("Mercenary Solos", mercColors);
talionCasters.models = new Array(getModelById("MW05"),getModelById("MW06"),getModelById("MW07"));
talionWarjacks.models = new Array(getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"),getModelById("MJ16"),getModelById("MJ17"),getModelById("MJ18"));
talionUnits.models = new Array(getModelById("MU10"),getModelById("MU11"),getModelById("MU12"),getModelById("MU13"),getModelById("MU14"));
talionUas.models = new Array(getModelById("MA01"),getModelById("MA02"));
talionSolos.models = new Array(getModelById("MS07"),getModelById("MS08"),getModelById("MS09"),getModelById("MS10"),getModelById("MS11"),getModelById("MS12"),getModelById("MS13"));
talionArmy.groups = new Array(talionCasters, talionWarjacks, talionUnits, talionUas, talionSolos);
addArmy(talionArmy);

var mercsArmy = new Army("Mercenaries", null, false, [rhulicArmy, fourStarArmy, highbornArmy, talionArmy, 
addWMHTierArmy(new Army("Magnus - Most Wanted", null, null, false, new Array(new Tier("Only", "Mw01 MJ01 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 PU13 PA03 MU08 MU15 MU18 MU01 MU04 YU02 YU05 YA07 Ya03 YA04 MS03 MS06 MS15 IS06 MS16", "PC", "MJ01--1", "FA", "YU02-1 YU05-1"),
		new Tier("Must have", "2(MU08 MU15 MU18)"),
		new Tier("Must have", "3(MJ01 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18)"),
		new Tier("Must have", "2(MJ01)")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("epic Magnus - Magnus' Agenda", null, null, false, new Array(new Tier("Only", "Mx01 MJ01 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 PU13 PA03 MU08 MU15 MU18 MU01 MU04 YU02 YU05 YA07 Ya03 YA04 MS03 MS06 MS15 IS06 MS16", "PC", "MJ09--1", "FA", "YU02-1 YU05-1"),
		new Tier("Must have", "MU04"),
		new Tier("Must have", "2(PU13)"),
		new Tier("Must have", "2(MJ09)")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("epic Magnus - Bad Seeds (NQ36)", null, null, false, new Array(new Tier("Only", "Mx01 MJ01 MJ02 MJ09 MJ10 MJ16 MJ11 YJ01 YJ03 Yj07 Yu08 YA05 YU13 MS06 MS15 IS06 YU05 Ya03 YA04 YU06 YU07 YU14 YA08 YS08"),
		new Tier("Must have", "YU13", "free", "MS06"),
		new Tier("Must have", "MS15|3(MJ01 MJ02 MJ09 MJ10 MJ16 MJ11 YJ01 YJ03 Yj07)"),
		new Tier("Must have", "IS06 Yu08")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Gorten - The Hammerfall Irregulars", null, null, false, new Array(new Tier("Only", "MW02 MJ05 MJ06 MJ07 MJ08 MJ14 MJ15 MU02 MU06 MA03 MU07 MU17 MU19 IW01 MS05 MS12 MS17", "FA", "MU06-U MS05-+1-MU02 MS05-+1-MU06 MS05-+1-MU07 MS05-+1-MU17"), 
		new Tier("Must have", "2MU06", "free", "MA03"),
		new Tier("Must have in battlegroup", "4(MJ05 MJ06 MJ07 MJ08 MJ14 MJ15)"),
		new Tier("Must have", "4(MU02 MU06 MU07 MU17)")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Durgen - Shock and Awe", null, null, false, new Array(new Tier("Only", "MW03 MJ07 MJ08 MJ14 MJ15 MU02 MU06 MA03 MU07 MU17 MU19 MS05 IS03 MS17", "FA", "MU17-+1-MU07", "PC", "MJ15--1"), 
		new Tier("Must have", "2MU07"),
		new Tier("Must have", "MU02"),
		new Tier("Must have in battlegroup", "3(MJ07 MJ08 MJ14 MJ15)")
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Ashlynn - Viva la resistance", null, null, false, new Array(new Tier("Only", "MW04 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 YU12 YA06 MU03 MU16 YU01 Ya01 MS14 MS03 MS18 MS21 MS04 MS20 MS19 YS02"),
		new Tier("Must have", "MS14 MS19"),
		new Tier("Must have", "2(MJ03)"),
		new Tier("Must have", "2(YU01)", "free", "Ya01")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Fiona - Devil to Pay", null, null, false, new Array(new Tier("Only", "MW05 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 MU12 MU13 MA01 MA02 MU04 MS10 MS06 MS22"), 
		new Tier("Must have", "2MU13"),
		new Tier("Must have", "4(MU12 MU13 MU04)"),
		new Tier("Must have in battlegroup", "2(MJ04 MJ12 MJ13)")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Bartolo - Rough Seas", null, null, false, new Array(new Tier("Only", "MW06 MJ03 MJ04 MJ10 MJ13 MJ16 MJ18 MU12 MU13 MA01 MA02 MU14 MS07 MS09 MS10 MS13", "FA", "MU14-+1-MU12 MU14-+1-MU13", "PC", "MJ13--1"), 
		new Tier("Must have", "2MU12"),
		new Tier("Must have", "MS13"),
		new Tier("Must have", "3(MJ10 MJ13 MJ16)")  
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Shae - A Pirate's Life", null, null, false, new Array(new Tier("Only", "MW07 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 MU10 MU11 MU12 MU13 MA01 MA02 MU14 MS08 MS09 MS10 MS11 MS12", "PC","MS08--1 MS09--1 MS10--1 MS11--1 MS12--1"),
		new Tier("Must have", "MA01"),
		new Tier("Must have", "MU10"),
		new Tier("Must have in battlegroup", "3(MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18)")
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("MacBain - Soldiers of Fortune", null, null, false, new Array(new Tier("Only", "MW08 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ18 MJ05 MJ06 MJ07 MJ08 MJ14 MJ15 MU08 MU15 MU18 MU09 MU03 MU04 MU16 IS01 MS03 MS06 MS15 MS04 MS20 MS16 MS19 MS17", "PC", "MU09--1 MU03--1 MU04--1 MU16--1"), 
		new Tier("Must have", "2MU08"),
		new Tier("Must have", "4(IS01 MS03 MS06 MS15 MS04 MS20 MS16 MS19 MS17)"),
		new Tier("Must have", "2(MJ11)")
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("Damiano - Free Company", null, null, false, new Array(new Tier("Only", "MW09 MJ02 MJ03 MJ04 MJ09 MJ10 MJ11 MJ12 MJ13 MJ16 MJ17 MJ18 MU08 MU15 MU18 MS16", "FA", "MU15-2", "PC", "MU15--1"), 
		new Tier("Must have", "3(MU08 MU15 MU18)"),
		new Tier("Must have", "MS16"),
		new Tier("Must have", "MJ17")
		)), mercColors, "Mercenary"),
addWMHTierArmy(new Army("General Ossrum - State of War", null, null, false, new Array(new Tier("Only", "MW10 MJ05 MJ06 MJ07 MJ08 MJ14 MJ15 MU02 MU06 MU07 MU17 MA03 MU19 MS05 MS12 MS17 IW01"), 
		new Tier("Must have", "2(MU02 MU06 MU17 MU19)"),
		new Tier("Must have", "2(MS05 MS12 MS17)"),
		new Tier("Must have in battlegroup", "3(MJ05 MJ06 MJ07 MJ08 MJ14 MJ15)")
		)), mercColors, "Mercenary")
]);
addArmy(mercsArmy);

var wmhListSizes = new Array(
		new ListSize("Duel (1 caster, 15pts)", [{name: 'casters', value:1}, {name: 'points', value:15}]),
		new ListSize("Duel (1 caster, 25pts)", [{name: 'casters', value:1}, {name: 'points', value:25}]),
		new ListSize("Duel (1 caster, 35pts)", [{name: 'casters', value:1}, {name: 'points', value:35}]),
		new ListSize("Germany 36 (1 caster, 36pts)", [{name: 'casters', value:1}, {name: 'points', value:36}]),
		new ListSize("Germany 42 (1 caster, 42pts)", [{name: 'casters', value:1}, {name: 'points', value:42}]),
		new ListSize("Skirmish (1 caster, 25pts)", [{name: 'casters', value:1}, {name: 'points', value:25}]),
		new ListSize("Skirmish (1 caster, 35pts)", [{name: 'casters', value:1}, {name: 'points', value:35}]),
		new ListSize("Skirmish (1 caster, 50pts)", [{name: 'casters', value:1}, {name: 'points', value:50}]),
		new ListSize("Grand melee (1 caster, 75pts)", [{name: 'casters', value:1}, {name: 'points', value:75}]),
		new ListSize("Grand melee (1 caster, 100pts)", [{name: 'casters', value:1}, {name: 'points', value:100}]),
		new ListSize("Battle Royale (2 casters, 100pts)", [{name: 'casters', value:2}, {name: 'points', value:100}]),
		new ListSize("Battle Royale (2 casters, 125pts)", [{name: 'casters', value:2}, {name: 'points', value:125}]),
		new ListSize("Battle Royale (2 casters, 150pts)", [{name: 'casters', value:2}, {name: 'points', value:150}]),
		new ListSize("War (3 casters, 150pts)", [{name: 'casters', value:3}, {name: 'points', value:150}]),
		new ListSize("War (3 casters, 175pts)", [{name: 'casters', value:3}, {name: 'points', value:175}]),
		new ListSize("War (3 casters, 200pts)", [{name: 'casters', value:3}, {name: 'points', value:200}]),
		new ListSize("Apocalypse (4 casters, 200pts)", [{name: 'casters', value:4}, {name: 'points', value:200}]),
		new ListSize("Apocalypse (5 casters, 250pts)", [{name: 'casters', value:5}, {name: 'points', value:25}]),
		new ListSize("Apocalypse (6 casters, 300pts)", [{name: 'casters', value:6}, {name: 'points', value:300}]),
		new ListSize("Apocalypse (7 casters, 350pts)", [{name: 'casters', value:7}, {name: 'points', value:350}]),
		new ListSize("Apocalypse (10 casters, 1000pts)", [{name: 'casters', value:10}, {name: 'points', value:1000}])
)


systems.push(new System("Warmachine", wmhListSizes, [{name:"redrawPoints", value:"wmhRedrawPoints"}, {name:"recalcPoints", value:"wmhRecalcPoints"}, {name:"rebuild", value: "wmhApplyTiers"}, {name:"rebuildModel", value: "wmhRebuildModel"}],
		[cygnarArmy, cryxArmy, menothArmy, khadorArmy, retributionArmy, mercsArmy], 
		[cygnarFaction, cryxFaction, menothFaction, khadorFaction, retributionFaction, mercFaction],
		"<p><b>The <a href='http://privateerpress.com/warmachine'>Warmachine</a> game is owned and copyrighted by the great people at <a href='http://privateerpress.com'>Privateer Press</a>.</b></p>"
		+ "<p>In WARMACHINE, the very earth shakes during fierce confrontations of Armageddon-like proportions. Six-ton constructs of tempered iron and steel slam into one another with the destructive force of a locomotive. Lead-spewing cannons chew through armor plating as easily as flesh. And a tempest of arcane magics sets the battlefield ablaze with such that the gods themselves fear to tread the tormented ground.</p>"
		+ "<p>Victory shall favor the bold! So bring it on! If you've got the metal.</p>"
		+ "<p>WARMACHINE is a fast-paced and aggressive 30mm tabletop miniatures battle game set in the steam-powered fantasy world of the Iron Kingdoms. Players take on the role of elite soldier-sorcerers known as warcasters. Though warcasters are formidable combatants on their own, their true strength lies in their magical ability to control and coordinate mighty warjacks' massive steam-powered combat automatons that are the pinnacle of military might in the Iron Kingdoms. Players collect, assemble, and paint fantastically detailed models representing the varied warriors, machines, and creatures in their armies. This is steam-powered miniatures combat, and your tabletop will never be the same!</p>"
		+ "<p>If you are working at Privateer Press and do not like this text, please contact me (info@fowardkommander.com).</p>"));
var circleArmy = new Army("Circle Orboros", null, true, [
addWMHTierArmy(new Army("Kaya - The Wild Hunt", null, null, false, new Array(new Tier("Only", "Ow01 OB01 OB02 OB05 OB07 OB08 OB09 OB11 OB13 OB15 OU04 OA05 OU07 OA07 OU06 OU08 OA03 OS06 OS07 OS05 OS04", "PC", "OU04--1", "FA", "OS05-+1-OU04"),
		new Tier("Must have", "OS04"),
		new Tier("Must have", "OU04"),
		new Tier("Must have", "2(OB05 OB07 OB08 OB09 OB11)")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("epic Kaya - Call of the Wild", null, null, false, new Array(new Tier("Only", "Ox01 OB01 OB02 OB05 OB07 OB08 OB09 OB11 OB13 OB15 OU01 OA01 OU09 OA04 OU11 OS06 OS05"),
		new Tier("Must have", "OU11"),
		new Tier("Must have", "OU01"),
		new Tier("Must have", "2(OB05 OB07 OB08 OB09 OB11)", "PC", "OB05--1 OB07--1 OB08--1 OB09--1 OB11--1")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Krueger - Storm Front", null, null, false, new Array(new Tier("Only", "Ow02 OB01 OB02 OB03 OB04 OB05 OB07 OB08 OB09 OB10 OB11 OB12 OB13 OB15 OU01 OA01 OU09 OA04 OU08 OA03 OS01 OS06 OS04", "FA", "OU01-U OA01-U", "FA", "OS01-+1-OU01"),
		new Tier("Must have", "OS04"),
		new Tier("Must have", "2OU01", "PC", "OU01--1"),
		new Tier("Must have", "2(OB05 OB07 OB08 OB09 OB10 OB11 OB12)")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("epic Krueger - The Devourer's Host", null, null, false, new Array(new Tier("Only", "Ox02 OB01 OB02 OB05 OB07 OB08 OB09 OB11 OB13 OB15 OU03 OA02 OA06 OU11 OS03 OS02", "FA", "OU03-U"),
		new Tier("Must have", "OS02"),
		new Tier("Must have", "2OU03"),
		new Tier("Must have", "2(OB07 OB09 OB11)")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("epic Krueger - Wake of Destruction (NQ38)", null, null, false, new Array(new Tier("Only", "Ox02 OB01 OB02 OB03 OB04 OB05 OB07 OB08 OB09 OB10 OB11 OB12 OB13 OB15 OU01 OA01 OU02 OU09 OA04 OS01 OS02 OS08 Ms01"),
		new Tier("Must have", "2(OU01)" , "free" , "OA01"),
		new Tier("Must have", "OS01"),
		new Tier("Must have", "2(OB05 OB07 OB08 OB09 OB10 OB11 OB12)")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Baldur - Rock of Orboros", null, null, false, new Array(new Tier("Only", "Ow03 OB03 OB04 OB06 OB10 OB12 OU01 OA01 OU02 OU09 OA04 OU10 OS01 OS06"),
		new Tier("Must have", "OU09 OU10"),
		new Tier("Must have", "2OU02"),
		new Tier("Must have", "OB06", "PC", "OB06--1 OB10--1 OB12--1")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("epic Baldur - Hour of Reckoning", null, null, false, new Array(new Tier("Only", "Ox03 OB03 OB04 OB06 OB10 OB12 OU01 OA01 OU09 OA04 OS01 OS08 OS02 OE01"),
		new Tier("Must have", "OU01"),
		new Tier("Must have", "OB06"),
		new Tier("Must have", "2(OB03 OB04)", "PC" , "OB03--1 OBo4--1")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Morvahna - Harvest of Blood", null, null, false, new Array(new Tier("Only", "OW04 OB01 OB02 OB03 OB04 OB13 OB15 OU01 OA01 OU07 OA07 OU05 OU06 OU09 OA04 OS01 OS06 OS05", "FA", "OU07-3 OU05-3"),
		new Tier("Must have", "OU07", "free", "OA07"),
		new Tier("Must have", "2OU05"),
		new Tier("Must have", "OU06")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Kromac - Heart Eaters", null, null, false, new Array(new Tier("Only", "OW05 OB01 OB02 OB05 OB07 OB08 OB09 OB11 OB13 OB14 OB15 OU03 OA02 OA06 OU05 OU06 OU07 OA07 OS02 OS03", "FA", "OU03-U OA02-U OS03-+1-OU03|OU05|OU06|OU07"),
		new Tier("Must have", "2OU03", "free", "OA06"),
		new Tier("Must have", "2OS03"),
		new Tier("Must have", "OS02")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Mohsar - Sandstorm", null, null, false, new Array(new Tier("Only", "OW06 OB01 OB02 OB03 OB04 OB05 OB07 OB08 OB09 OB10 OB11 OB12 OB13 OB15 OU02 OU04 OA05 OU09 OA04 OU10 OU01 OA01 OS01 OS07 OS05 OS02"),
		new Tier("Must have", "OU02"),
		new Tier("Must have", "2OU01", "free", "OA01"),
		new Tier("Must have", "2(OB05 OB07 OB08 OB09 OB10 OB11 OB12)")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Cassius - Widower's Wood", null, null, false, new Array(new Tier("Only", "OW07 OB03 OB04 OB05 OB06 OB07 OB08 OB09 OB10 OB11 OB12 OB14 OU01 OA01 OU04 OA05 OU09 OA04 OU10 OU11 IS02 OS07 OS05 OS02", "FA", "OU11-U OS05-+1-OU01|OU04|OU09|OU10|OU11"),
		new Tier("Must have", "2OU11"),
		new Tier("Must have", "OS02"),
		new Tier("Must have", "OB11")
		)), circleColors, "Circle"),
addWMHTierArmy(new Army("Grayle - Claw & Fang", null, null, false, new Array(new Tier("Only", "OW08 OB01 OB15 OB07 OB09 OB11 OU08 OA03 OU04 OA05 OU11 OS05 OS07 OS04", "FA", "OU08-U OU04-U OA05-U"),
		new Tier("Must have", "2(OU08 OU04 OU11)", "free", "OS05"),
		new Tier("Must have", "OS04"),
		new Tier("Must have", "3(OB01 OB15)")
		)), circleColors, "Circle")
]);
var circleCasters = new ArmyGroup("Circle Warlocks", circleColors);
var circleWarbeasts = new ArmyGroup("Circle Warbeasts", circleColors);
var circleBattleEngines = new ArmyGroup("Circle Battle Engines", circleColors);
var circleUnits = new ArmyGroup("Circle Units", circleColors);
var circleUas = new ArmyGroup("Circle Unit Attachments", circleColors);
var circleSolos = new ArmyGroup("Circle Solos", circleColors);
var circleMinionCasters = new ArmyGroup("Minion Warcasters", minionColors, null, true);
var circleMinionBeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var circleMinionLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
var circleMinionUnits = new ArmyGroup("Minion Units", minionColors);
var circleMinionSolos = new ArmyGroup("Minion Solos", minionColors);
circleCasters.models = new Array(getModelById("OW01"),getModelById("OW02"),getModelById("OW03"),getModelById("OW04"),getModelById("OW05"),getModelById("OW06"),getModelById("OW07"),getModelById("OW08"));
circleWarbeasts.models = new Array(getModelById("OB01"),getModelById("OB02"),getModelById("OB03"),getModelById("OB04"),getModelById("OB05"),getModelById("OB06"),getModelById("OB07"),getModelById("OB08"),getModelById("OB09"),getModelById("OB10"),getModelById("OB11"),getModelById("OB12"),getModelById("OB13"),getModelById("OB14"),getModelById("OB15"));
circleBattleEngines.models = new Array(getModelById("OE01"));
circleUnits.models = new Array(getModelById("OU01"),getModelById("OU02"),getModelById("OU03"),getModelById("OU04"),getModelById("OU05"),getModelById("OU06"),getModelById("OU07"),getModelById("OU08"),getModelById("OU09"),getModelById("OU10"),getModelById("OU11"));
circleUas.models = new Array(getModelById("OA01"),getModelById("OA02"),getModelById("OA03"),getModelById("OA04"),getModelById("OA05"),getModelById("OA06"),getModelById("OA07"));
circleSolos.models = new Array(getModelById("OS01"),getModelById("OS02"),getModelById("OS03"),getModelById("OS04"),getModelById("OS05"),getModelById("OS06"),getModelById("OS07"),getModelById("OS08"));
circleMinionCasters.models = new Array(getModelById("IW05"),getModelById("IW06"),getModelById("IW07"),getModelById("IW08"),getModelById("IW09"),getModelById("IW10"));
circleMinionBeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
circleMinionLesserCasters.models = new Array(getModelById("IW01"),getModelById("IW02"),getModelById("IW03"),getModelById("IW04"));
circleMinionUnits.models = new Array(getModelById("MU05"),getModelById("IU01"),getModelById("IU02"),getModelById("IU03"),getModelById("IU04"),getModelById("IU05"),getModelById("IU06"),getModelById("IU07"));
circleMinionSolos.models = new Array(getModelById("IS01"),getModelById("IS02"),getModelById("IS03"),getModelById("IS04"),getModelById("IS05"),getModelById("IS06"),getModelById("IS07"),getModelById("IS08"),getModelById("IS09"),getModelById("IS10"),getModelById("IS11"));
circleArmy.groups = new Array(circleCasters, circleWarbeasts, circleBattleEngines, circleUnits, circleUas, circleSolos, circleMinionCasters, circleMinionLesserCasters, circleMinionBeasts, circleMinionUnits, circleMinionSolos);
addArmy(circleArmy);



var everblightArmy = new Army("Legion of Everblight", null, true, [
addWMHTierArmy(new Army("Lylyth - Hunter Killers", null, null, false, new Array(new Tier("Only", "Ew01 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU01 EA01 EU04 EU07 EA03 EU11 EA04 ES02 ES04 ES08", "FA", "EU04-2"),
		new Tier("Must have", "2EU01", "free", "EA01"),
		new Tier("Must have", "ES08"),
		new Tier("Must have", "2EB05")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("epic Lylyth - Ravens of War", null, null, false, new Array(new Tier("Only", "Ex01 EB06 EB07 EB08 EB09 EB12 EB13 EB14 EB16 EU04 EU07 EA03 ES08 ES04", "FA", "EU07-U ES04-+1-EU04|EU07"),
		new Tier("Must have", "2EU07", "free", "EA03"),
		new Tier("Must have", "2ES04"),
		new Tier("Must have", "3(EB06 EB07 EB08 EB09 EB12 EB13 EB14 EB16)")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Thagrosh - Army of Annihilation", null, null, false, new Array(new Tier("Only", "Ew02 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU06 EU08 EU09 ES05 ES06", "FA", "EU06-2 EU08-U EU09-U"),
		new Tier("Must have", "2(EU08 EU09)", "free", "ES06"),
		new Tier("Must have", "EU06"),
		new Tier("Must have", "2(EB07 EB08 EB09 EB11 EB13)")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("epic Thagrosh - Dragon's Host", null, null, false, new Array(new Tier("Only", "Ex02 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB10 EB11 EB12 EB13 EB14 EB16 EU02 EA05 EU10 ES02 ES07 ES05 ES01 ES03", "FA", "EU02-U"),
		new Tier("Must have", "ES01"),
		new Tier("Must have", "2EU02"),
		new Tier("Must have", "2(EB07 EB08 EB09 EB10 EB11 EB13)", "free", "ES03") // for each two
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Vayl - Winter Storm", null, null, false, new Array(new Tier("Only", "Ew03 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU01 EA01 EU02 EA05 EU03 EA02 EU04 EU05 EU07 EA03 EU10 EU11 EA04 EU06 ES03 ES02 ES07 ES01 ES09", "FA", "EU11-U"),
		new Tier("Must have", "2EU11", "free", "EA04"),
		new Tier("Must have", "EU06"),
		new Tier("Must have", "5(EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16)")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("epic Vayl - Machinations of Shadow", null, null, false, new Array(new Tier("Only", "Ex03 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB10 EB11 EB12 EB13 EB14 EB15 EB16 EU02 EU05 EU06 EU11 EA04 EU12 ES03 ES07 ES01 EE01"),
		new Tier("Must have", "EU06"),
		new Tier("Must have", "3(EB01 EB04 EB08 EB07)"),
		new Tier("Must have", "3(EB07 EB08 EB09 EB10 EB11 EB13 EB15)", "PC", "EB07--1 EB08--1 EB09--1 EB10--1 EB11--1 EB13--1 EB15--1")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Rhyas - Alpha Strike", null, null, false, new Array(new Tier("Only", "EW04 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU11 EA04 EU03 EA02 EU12 ES03 ES02", "FA", "EU03-U EA02-U"),
		new Tier("Must have", "2EU03"),
		new Tier("Must have", "EU12"),
		new Tier("Must have", "2EB08", "PC", "EB08--1")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Rhyas - Rearguard (NQ36)", null, null, false, new Array(new Tier("Only", "EW04 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB10 EB11 EB12 EB13 EB14 EB16 EU03 EA02 EU08 EU09 ES03 ES06 ES09", "FA", "ES06-+1-EU08|EU09"),
		new Tier("Must have", "EU03", "free", "EA02"),
		new Tier("Must have", "EB10"),
		new Tier("Must have", "2(EU08 EU09)")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Saeryn - Fallen Angels", null, null, false, new Array(new Tier("Only", "EW05 EB04 EB07 EB08 EB01 EB03 EB14 EU10 ES01 ES03 ES07"),
		new Tier("Must have", "ES01"),
		new Tier("Must have", "2(EB07 EB08)"),
		new Tier("Must have in battlegroup", "4(EB03 EB04 EB14)", "free", "EB14 EB03 EB04")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Absylonia - Winds of Change", null, null, false, new Array(new Tier("Only", "EW06 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB10 EB11 EB12 EB13 EB14 EB15 EB16 EU06 ES03 ES05", "FA", "ES05-+1-EB07|EB08|EB09|EB10|EB11|EB13|EB15"),
		new Tier("Must have", "3(EB01 EB02 EB12)"),
		new Tier("Must have", "2(ES05)"),
		new Tier("Must have", "2(EB07 EB08 EB09 EB10 EB11 EB13 EB15)", "PC", "EB07--1 EB08--1 EB09--1 EB10--1 EB11--1 EB13--1 EB15--1")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Bethayne - Black Magic", null, null, false, new Array(new Tier("Only", "EW07 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU06 EU11 EA04 EU12 ES05 ES02 ES07 ES01 ES09", "FA", "ES01-+1-EU06|EU11|EU12", "PC", "ES01--1"),
		new Tier("Must have", "2ES01"),
		new Tier("Must have", "2(EU11 EU12)"),
		new Tier("Must have", "2(EB07 EB08 EB09 EB11 EB13)")
		)), everblightColors, "Everblight"),
addWMHTierArmy(new Army("Kallus - Unconquerable Dominion", null, null, false, new Array(new Tier("Only", "EW08 EB01 EB02 EB03 EB04 EB05 EB06 EB07 EB08 EB09 EB11 EB12 EB13 EB14 EB16 EU10 EU02 EA05 EU03 EA02 ES02 ES07", "PC", "EU03--1"),
		new Tier("Must have", "1(EA05 EA02)"),
		new Tier("Must have", "2(EB07 EB08 EB09 EB11 EB13)"),
		new Tier("Must have", "4(EU10 EU02 EU03)")
		)), everblightColors, "Everblight")
]);
var everblightCasters = new ArmyGroup("Everblight Warlocks", everblightColors);
var everblightWarbeasts = new ArmyGroup("Everblight Warbeasts", everblightColors);
var everblightBattleEngines = new ArmyGroup("Everblight Battle Engines", everblightColors);
var everblightUnits = new ArmyGroup("Everblight Units", everblightColors);
var everblightUas = new ArmyGroup("Everblight Unit Attachments", everblightColors);
var everblightSolos = new ArmyGroup("Everblight Solos", everblightColors);
var everblightMinionCasters = new ArmyGroup("Minion Warcasters", minionColors, null, true);
var everblightMinionBeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var everblightMinionLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
var everblightMinionUnits = new ArmyGroup("Minion Units", minionColors);
var everblightMinionSolos = new ArmyGroup("Minion Solos", minionColors);
everblightCasters.models = new Array(getModelById("EW01"),getModelById("EW02"),getModelById("EW03"),getModelById("EW04"),getModelById("EW05"),getModelById("EW06"),getModelById("EW07"),getModelById("EW08"));
everblightWarbeasts.models = new Array(getModelById("EB01"),getModelById("EB02"),getModelById("EB03"),getModelById("EB04"),getModelById("EB05"),getModelById("EB06"),getModelById("EB07"),getModelById("EB08"),getModelById("EB09"),getModelById("EB10"),getModelById("EB11"),getModelById("EB12"),getModelById("EB13"),getModelById("EB14"),getModelById("EB15"),getModelById("EB16"));
everblightBattleEngines.models = new Array(getModelById("EE01"));
everblightUnits.models = new Array(getModelById("EU01"),getModelById("EU02"),getModelById("EU03"),getModelById("EU04"),getModelById("EU05"),getModelById("EU06"),getModelById("EU07"),getModelById("EU08"),getModelById("EU09"),getModelById("EU10"),getModelById("EU11"),getModelById("EU12"));
everblightUas.models = new Array(getModelById("EA01"),getModelById("EA02"),getModelById("EA03"),getModelById("EA04"),getModelById("EA05"));
everblightSolos.models = new Array(getModelById("ES01"),getModelById("ES02"),getModelById("ES03"),getModelById("ES04"),getModelById("ES05"),getModelById("ES06"),getModelById("ES07"),getModelById("ES08"),getModelById("ES09"));
everblightMinionCasters.models = new Array(getModelById("IW05"),getModelById("IW06"),getModelById("IW07"),getModelById("IW08"),getModelById("IW09"),getModelById("IW10"));
everblightMinionBeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
everblightMinionLesserCasters.models = new Array(getModelById("IW03"),getModelById("IW04"));
everblightMinionUnits.models = new Array(getModelById("IU01"),getModelById("IU02"),getModelById("IU03"),getModelById("IU04"),getModelById("IU05"),getModelById("IU06"),getModelById("IU07"));
everblightMinionSolos.models = new Array(getModelById("IS02"),getModelById("IS03"),getModelById("IS07"),getModelById("IS08"),getModelById("IS09"),getModelById("IS10"),getModelById("IS11"));
everblightArmy.groups = new Array(everblightCasters, everblightWarbeasts, everblightBattleEngines, everblightUnits, everblightUas, everblightSolos, everblightMinionCasters, everblightMinionLesserCasters, everblightMinionBeasts, everblightMinionUnits, everblightMinionSolos);
addArmy(everblightArmy);



var skorneArmy = new Army("Skorne", null, true, [
addWMHTierArmy(new Army("Morghoul - Big Game Hunters", null, null, false, new Array(new Tier("Only", "Sw01 SB01 SB02 SB03 SB06 SB07 SB08 SB11 SB14 SU02 SU01 SU05 SS03 SS07", "FA", "SU05-U"),
		new Tier("Must have", "2SU02"),
		new Tier("Must have", "2SU05", "PC", "SB06--1 SB07--1 SB08--1 SB11--1"),
		new Tier("Must have", "2(SB06 SB07 SB08 SB11)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("epic Morghoul - Imperial Executioners", null, null, false, new Array(new Tier("Only", "Sx01 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15 SU01 SU05 SS03 SS07", "FA", "SU01-U"),
		new Tier("Must have", "2SU01", "free", "SS03"),
		new Tier("Only", "Sx01 SB01 SB02 SB03 SB04 SB05 SB09 SB12 SB14 SB15 SU01 SU05 SS03 SS07"),
		new Tier("Must have", "4(SB01 SB02 SB03 SB04 SB05 SB09 SB12 SB14 SB15)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Makeda - Army of the Western Reaches", null, null, false, new Array(new Tier("Only", "Sw02 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB10 SB11 SB12 SB14 SB15 SU03 SA03 SU05 SU09 SU06 SU07 SU08 SA01 SU10 SU11 SA02 SU13 SU14 IS06", "FA", "SU08-U SU11-U"),
		new Tier("Must have", "2SU11", "free", "SA02"),
		new Tier("Must have", "SU09"),
		new Tier("Must have", "2(SB01 SB02 SB03 SB10 SB14)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("epic Makeda - Imperishable Dominion", null, null, false, new Array(new Tier("Only", "Sx02 SB01 SB02 SB03 SB10 SB14 SU05 SU09 SU06 SU07 SU08 SA01 SS02 SS09 SS04 SS08 SS05 MS15", "FA", "SU06-2"),
		new Tier("Must have", "2SU08", "free", "SA01"),
		new Tier("Must have", "SS05"),
		new Tier("Must have", "SB10")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Hexeris - Kingdom of Shadow", null, null, false, new Array(new Tier("Only", "Sw03 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15 SU05 SU02 SU03 SA03 SU06 SU07 SU08 SA01 SS01 SS06 SS02 SS09 SS04 SS08"),
		new Tier("Must have", "2SU08"),
		new Tier("Must have", "SS08"),
		new Tier("Must have", "2(SU02 SU03)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("epic Hexeris - Practical Magic", null, null, false, new Array(new Tier("Only", "Sx03 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15 SU05 SU06 SU07 SU08 SA01 SU10 SU11 SA02 SU12 SU13 SU14 SS01 SS06 SS02 SS09 SS04"),
		new Tier("Must have", "4(SS02 SS09)", "free", "SS02"),
		new Tier("Must have", "2(SU05 SU06 SU07 SU08 SU10 SU11 SU12 SU13 SU14)"),
		new Tier("Must have", "3(SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Xerxis - The fist of Halaak", null, null, false, new Array(new Tier("Only", "SW04 SB06 SB07 SB08 SB09 SB10 SB11 SB13 SB15 SU05 SU09 SU02 SU03 SA03 SU10 SU11 SA02 SU13 SU14", "FA", "SU02-U SU03-U"),
		new Tier("Must have", "2(SU02 SU03)", "PC", "SU02--1 SU03--1"),
		new Tier("Must have", "2(SU10 SU13)"),
		new Tier("Must have", "SB08")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Xerxis - The Abyssal Cohort (NQ39)", null, null, false, new Array(new Tier("Only", "SW04 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB13 SB14 SB15 SU02 SA04 SU05 SU07 SU09 SS02 SS04"),
		new Tier("Must have", "2(SU07)"),
		new Tier("Must have", "2(SS02 SS04)"),
		new Tier("Must have", "2(SB06)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Zaal - Immortal Host", null, null, false, new Array(new Tier("Only", "SW05 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15 SU04 SU06 SU07 SU08 SA01 SS02 SS09 SS04 SS08", "FA", "SU04-U SS02-+1-SU04|SU06|SU07|SU08 SS04-+1-SU04|SU06|SU07|SU08"),
		new Tier("Must have", "SS09"),
		new Tier("Must have", "3(SS04 SS08)"),
		new Tier("Must have", "2SU04")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Mordikaar - Legions of the Abyss", null, null, false, new Array(new Tier("Only", "SW06 SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15 SU12 SU07 SU08 SA01 SS01 SS06 IS02"),
		new Tier("Must have", "2(SU12 SU07 SU08)", "free", "SS06"), // for each
		new Tier("Must have", "5(SS06 IS02)"),
		new Tier("Must have", "3(SB01 SB02 SB03 SB04 SB05 SB06 SB07 SB08 SB09 SB11 SB12 SB14 SB15)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Rasheth - Chain Gang", null, null, false, new Array(new Tier("Only", "SW07 SB04 SB05 SB06 SB07 SB08 SB11 SU02 SU05 SU12 SU10 SU11 SA02 SU13 SU14 IU01 IU02 IU03 IU04 IU05 IU06 IU07 SS01 SS07", "PC", "SB06--1 SB07--1 SB08--1 SB11--1", "FA", "SS01-+1-SB06|SB07|SB08|SB11"),
		new Tier("Must have", "1SS07|1(IU01 IU02 IU03 IU04 IU05 IU06 IU07)"),
		new Tier("Must have", "2SS01"),
		new Tier("Must have", "3(SB06 SB07 SB08 SB11)")
		)), skorneColors, "Skorne"),
addWMHTierArmy(new Army("Naaresh - No Pain, No Gain", null, null, false, new Array(new Tier("Only", "SW08 SB01 SB02 SB03 SB04 SB05 SB09 SB12 SB14 SB15 SU01 SU05 SU12 SS01 SS03 SS07", "FA", "SU05-U"),
		new Tier("Must have", "2SU12"),
		new Tier("Must have", "2SU05"),
		new Tier("Must have", "3(SB01 SB02 SB03 SB04 SB05 SB09 SB12 SB14 SB15)")
		)), skorneColors, "Skorne")
]);
var skorneCasters = new ArmyGroup("Skorne Warlocks", skorneColors);
var skorneWarbeasts = new ArmyGroup("Skorne Warbeasts", skorneColors);
var skorneBattleEngines = new ArmyGroup("Skorne Battle Engines", skorneColors);
var skorneUnits = new ArmyGroup("Skorne Units", skorneColors);
var skorneUas = new ArmyGroup("Skorne Unit Attachments", skorneColors);
var skorneSolos = new ArmyGroup("Skorne Solos", skorneColors);
var skorneMinionCasters = new ArmyGroup("Minion Warcasters/Warlocks", minionColors, null, true);
var skorneMinionBeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var skorneMinionWarjacks = new ArmyGroup("Minion Warjacks", minionColors);
var skorneMinionLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
var skorneMinionUnits = new ArmyGroup("Minion Units", minionColors);
var skorneMinionSolos = new ArmyGroup("Minion Solos", minionColors);
skorneCasters.models = new Array(getModelById("SW01"),getModelById("SW02"),getModelById("SW03"),getModelById("SW04"),getModelById("SW05"),getModelById("SW06"),getModelById("SW07"),getModelById("SW08"));
skorneWarbeasts.models = new Array(getModelById("SB01"),getModelById("SB02"),getModelById("SB03"),getModelById("SB04"),getModelById("SB05"),getModelById("SB06"),getModelById("SB07"),getModelById("SB08"),getModelById("SB09"),getModelById("SB10"),getModelById("SB11"),getModelById("SB12"),getModelById("SB13"),getModelById("SB14"),getModelById("SB15"));
skorneBattleEngines.models = new Array(getModelById("SE01"));
skorneUnits.models = new Array(getModelById("SU01"),getModelById("SU02"),getModelById("SU03"),getModelById("SU04"),getModelById("SU05"),getModelById("SU06"),getModelById("SU07"),getModelById("SU08"),getModelById("SU09"),getModelById("SU10"),getModelById("SU11"),getModelById("SU12"),getModelById("SU13"),getModelById("SU14"));
skorneUas.models = new Array(getModelById("SA01"),getModelById("SA02"),getModelById("SA03"));
skorneSolos.models = new Array(getModelById("SS01"),getModelById("SS02"),getModelById("SS03"),getModelById("SS04"),getModelById("SS05"),getModelById("SS06"),getModelById("SS07"),getModelById("SS08"),getModelById("SS09"));
skorneMinionCasters.models = new Array(getModelById("Mx01"),getModelById("IW05"),getModelById("IW06"),getModelById("IW07"),getModelById("IW08"),getModelById("IW09"),getModelById("IW10"));
skorneMinionBeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
skorneMinionWarjacks.models = new Array(getModelById("MJ01"),getModelById("MJ02"),getModelById("MJ03"),getModelById("MJ04"),getModelById("MJ09"),getModelById("MJ10"),getModelById("MJ11"),getModelById("MJ12"),getModelById("MJ13"));
skorneMinionLesserCasters.models = new Array(getModelById("IW03"),getModelById("IW04"));
skorneMinionUnits.models = new Array(getModelById("IU01"),getModelById("IU02"),getModelById("IU03"),getModelById("IU04"),getModelById("IU05"),getModelById("IU06"),getModelById("IU07"));
skorneMinionSolos.models = new Array(getModelById("MS15"),getModelById("IS02"),getModelById("IS03"),getModelById("IS06"),getModelById("IS07"),getModelById("IS08"),getModelById("IS09"),getModelById("IS10"),getModelById("IS11"));
skorneArmy.groups = new Array(skorneCasters, skorneWarbeasts, skorneBattleEngines, skorneUnits, skorneUas, skorneSolos, skorneMinionCasters, skorneMinionLesserCasters, skorneMinionBeasts, skorneMinionWarjacks, skorneMinionUnits, skorneMinionSolos);
addArmy(skorneArmy);


var trollbloodArmy = new Army("Trollblood", null, true, [
addWMHTierArmy(new Army("Madrak - War Party", null, null, false, new Array(new Tier("Only", "Tw01 TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB11 TB12 TB14 TU02 TA03 TU01 TA01 TA02 TU04 TU07 TA04 TU10 TA06 TS01 TS02 TS03 TS06", "FA", "TU01-U TA01-U TA02-U"),
		new Tier("Must have", "2TU01", "free", "TA01"),
		new Tier("Must have", "2TU04"),
		new Tier("Must have", "TB03 TB05")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("epic Madrak - End Times", null, null, false, new Array(new Tier("Only", "Tx01 TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB11 TB12 TB14 TU01 TA01 TA02 TU08 TU06 TA05 TU07 TA04 TS04 TS06 TS03 TS05", "FA", "TU08-2"),
		new Tier("Must have", "2TU07", "free", "TA04"),
		new Tier("Must have", "TS05"),
		new Tier("Must have", "2(TB07 TB08 TB09 TB11)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Hoarluk - Runes of War", null, null, false, new Array(new Tier("Only", "Tw02 TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB10 TB11 TB12 TB14 TU02 TA03 TU09 TS02 TS06 TS03 TS08", "PC", "TU09--1", "FA", "TU09-U"),
		new Tier("Must have", "TS08"),
		new Tier("Must have", "2TU09"),
		new Tier("Must have", "2(TB07 TB08 TB09 TB10 TB11)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("epic Hoarluk - Unbridled Fury", null, null, false, new Array(new Tier("Only", "Tx02 TB07 TB08 TB09 TB10 TB11 TU06 TA05 TU11 TS07 TS06 TS03", "FA", "TS03-+1-TB07|TB08|TB09|TB10|TB11"),
		new Tier("Must have", "2(TU06 TU11)"),
		new Tier("Must have", "2(TS03)"),
		new Tier("Must have", "TB10", "PC","TB07--1 TB08--1 TB09--1 TB10--1 TB11--1")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Grissel - Blood of Bragg", null, null, false, new Array(new Tier("Only", "Tw03 TB01 TB02 TB03 TB04 TB05 TB06 TB12 TB14 TU02 TA03 TU01 TA01 TA02 TU10 TA06 TU05 TU12 TU03 TU04 TS04 TS01 IS01", "PC", "TS01--1"),
		new Tier("Must have", "2TU01"),
		new Tier("Must have", "2(TU03 TU04)"),
		new Tier("Must have", "3(TB01 TB02 TB03 TB04 TB05 TB06 TB12 TB14)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("epic Grissel - Blockade Runners", null, null, false, new Array(new Tier("Only", "Tx03 TB03 TB04 TB05 TB07 TB11 TB08 TU01 TA01 TA02 TU04 TU08 TU13 TS05 TS03 TE01", "PC", "TU08--1 TS05--1 TE01--1"),
		new Tier("Must have", "TS05"),
		new Tier("Must have", "TU13"),
		new Tier("Must have", "3(TB03 TB04 TB05 TB07 TB11 TB08)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Grim Angus - Headhunters", null, null, false, new Array(new Tier("Only", "TW04 TB01 TB02 TB05 TB06 TB07 TB11 TB12 TB14 TU11 TU03 TU04 MU16 TS07 IS01", "FA", "TU11-U TS07-+1-TU11|TU03|TU04|MU16"),
		new Tier("Must have", "MU16"),
		new Tier("Must have", "2(TU11 TU03 TU04 MU16)"),
		new Tier("Must have", "3(TB01 TB02 TB05 TB06 TB07 TB11 TB12 TB14)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Borka - Drunk and Disorderly", null, null, false, new Array(new Tier("Only", "TW05 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB11 TB13 TU08 TU07 TA04 TU06 TA05 TU11 TS01 TS02 TS04 TS07 TS03"),
		new Tier("Must have", "TU11"),
		new Tier("Must have", "TA05"),
		new Tier("Must have", "2TB06", "PC", "TB06--1")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Borka - Family Reunion (NQ38)", null, null, false, new Array(new Tier("Only", "TW05 TB01 TB02 TB06 TB07 TB08 TB09 TB11 TB12 TB13 TB14 TU02 TA03 TU06 TA05 TU12 TS04 TS02 TE01 MU01 IS03", "FA" , "TU12-2 TU06-3"),
		new Tier("Must have", "2(TS04)"),
		new Tier("Must have", "TS02"),
		new Tier("Must have", "3(TU12 TU06)", "PC", "TU06--1 TU12--1")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Calandra - Children of Dhunia", null, null, false, new Array(new Tier("Only", "TW06 TB01 TB02 TB03 TB04 TB05 TB06 TB12 TB09 TB14 TU02 TA03 TU01 TA01 TA02 TU10 TA06 TU11 TU03 TU04 TS01 TS02 TS06 TS03"),
		new Tier("Must have", "2(TS01 TS02 TS06)"),
		new Tier("Must have", "1(TU03 TU04)"),
		new Tier("Must have", "2TB09", "PC", "TB09--1")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Gunnbjorn - The Big Bang", null, null, false, new Array(new Tier("Only", "TW07 TB04 TB01 TB02 TB05 TB06 TB07 TB11 TB12 TB14 TU03 TU04 TU05 TU10 TA06 TU11 TU12 TU13 TS03 TS01", "PC", "TB07--1 TB11--1"),
		new Tier("Must have", "2(TU4 TU05 TU10 TU11 TU12 TU13)"),
		new Tier("Must have", "2TU05"),
		new Tier("Must have", "3(TB07 TB11)")
		)), trollbloodColors, "Trollblood"),
addWMHTierArmy(new Army("Jarl Skuld - Highwaymen", null, null, false, new Array(new Tier("Only", "TW08 TB01 TB02 TB03 TB04 TB05 TB06 TB07 TB08 TB09 TB11 TB12 TB14 TU01 TA01 TA02 TU04 TU10 TA06 TU13 TS02 TS07 TS03"),
		new Tier("Must have", "2TU10", "free", "TA06"),
		new Tier("Must have", "3(TU01 TU04 TU10 TU13)"),
		new Tier("Must have", "3(TB01 TB02 TB03 TB04 TB05 TB06 TB12 TB14)")
		)), trollbloodColors, "Trollblood")
]);
var trollbloodCasters = new ArmyGroup("Trollblood Warlocks", trollbloodColors);
var trollbloodWarbeasts = new ArmyGroup("Trollblood Warbeasts", trollbloodColors);
var trollbloodBattleEngines = new ArmyGroup("Trollblood Battle Engines", trollbloodColors);
var trollbloodUnits = new ArmyGroup("Trollblood Units", trollbloodColors);
var trollbloodUas = new ArmyGroup("Trollblood Unit Attachments", trollbloodColors);
var trollbloodSolos = new ArmyGroup("Trollblood Solos", trollbloodColors);
var trollbloodMinionCasters = new ArmyGroup("Minion Warcasters", minionColors, null, true);
var trollbloodMinionBeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var trollbloodMinionLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
var trollbloodMinionUnits = new ArmyGroup("Minion Units", minionColors);
var trollbloodMinionSolos = new ArmyGroup("Minion Solos", minionColors);
trollbloodCasters.models = new Array(getModelById("TW01"),getModelById("TW02"),getModelById("TW03"),getModelById("TW04"),getModelById("TW05"),getModelById("TW06"),getModelById("TW07"),getModelById("TW08"));
trollbloodWarbeasts.models = new Array(getModelById("TB01"),getModelById("TB02"),getModelById("TB03"),getModelById("TB04"),getModelById("TB05"),getModelById("TB06"),getModelById("TB07"),getModelById("TB08"),getModelById("TB09"),getModelById("TB10"),getModelById("TB11"),getModelById("TB12"),getModelById("TB13"),getModelById("TB14"));
trollbloodBattleEngines.models = new Array(getModelById("TE01"));
trollbloodUnits.models = new Array(getModelById("TU01"),getModelById("TU02"),getModelById("TU03"),getModelById("TU04"),getModelById("TU05"),getModelById("TU06"),getModelById("TU07"),getModelById("TU08"),getModelById("TU09"),getModelById("TU10"),getModelById("TU11"),getModelById("TU12"),getModelById("TU13"));
trollbloodUas.models = new Array(getModelById("TA01"),getModelById("TA02"),getModelById("TA03"),getModelById("TA04"),getModelById("TA05"),getModelById("TA06"));
trollbloodSolos.models = new Array(getModelById("TS01"),getModelById("TS02"),getModelById("TS03"),getModelById("TS04"),getModelById("TS05"),getModelById("TS06"),getModelById("TS07"),getModelById("TS08"));
trollbloodMinionCasters.models = new Array(getModelById("IW05"),getModelById("IW06"),getModelById("IW07"),getModelById("IW09"),getModelById("IW10"));
trollbloodMinionBeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB06"),getModelById("IB07"),getModelById("IB08"));
trollbloodMinionLesserCasters.models = new Array(getModelById("IW01"),getModelById("IW02"),getModelById("IW03"),getModelById("IW04"));
trollbloodMinionUnits.models = new Array(getModelById("MU01"),getModelById("MU05"),getModelById("MU16"),getModelById("IU01"),getModelById("IU02"),getModelById("IU03"),getModelById("IU04"),getModelById("IU05"),getModelById("IU06"),getModelById("IU07"));
trollbloodMinionSolos.models = new Array(getModelById("IS01"),getModelById("IS02"),getModelById("IS03"),getModelById("IS04"),getModelById("IS05"),getModelById("IS06"),getModelById("IS07"),getModelById("IS08"),getModelById("IS09"),getModelById("IS10"),getModelById("IS11"));
trollbloodArmy.groups = new Array(trollbloodCasters, trollbloodWarbeasts, trollbloodBattleEngines, trollbloodUnits, trollbloodUas, trollbloodSolos, trollbloodMinionCasters, trollbloodMinionLesserCasters, trollbloodMinionBeasts, trollbloodMinionUnits, trollbloodMinionSolos);
addArmy(trollbloodArmy);


//Farrow stuff, DR.ARCADIUS,ALTEN ASHLEY,GUDRUN,SAXXON ORRICK,AND VIKTOR PENDRAKE. INCREASE FA OF ALL NON CHARACTER FARROW MODELS AND UNITS BY +1 
var thornfallArmy = new Army("Thornfall Alliance", "+1FA");
var thornfallCasters = new ArmyGroup("Minion Warlocks", minionColors);
var thornfallWarbeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var thornfallUnits = new ArmyGroup("Minion Units", minionColors);
var thornfallSolos = new ArmyGroup("Minion Solos", minionColors);
var thornfallLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
var thornfallLesserTierWarbeasts = new ArmyGroup("Discount Warbeasts for tiers", minionColors);
thornfallCasters.models = new Array(getModelById("IW05"),getModelById("IW08"),getModelById("IW10"));
thornfallWarbeasts.models = new Array(getModelById("IB01"),getModelById("IB02"),getModelById("IB06"));
thornfallUnits.models = new Array(getModelById("IU02"),getModelById("IU03"),getModelById("IU06"),getModelById("IU07"));
thornfallSolos.models = new Array(getModelById("IS01"),getModelById("IS03"),getModelById("IS05"),getModelById("IS06"),getModelById("IS10"));
thornfallLesserCasters.models = new Array(getModelById("IW03"));
thornfallLesserTierWarbeasts.models = new Array(getModelById("Ib01"),getModelById("Ib02"));
thornfallArmy.groups = new Array(thornfallCasters, thornfallWarbeasts, thornfallUnits, thornfallSolos, thornfallLesserCasters, thornfallLesserTierWarbeasts);
addArmy(thornfallArmy);

var blindwaterArmy = new Army("Blindwater Congregation");
var blindwaterCasters = new ArmyGroup("Minion Warlocks", minionColors);
var blindwaterWarbeasts = new ArmyGroup("Minion Warbeasts", minionColors);
var blindwaterUnits = new ArmyGroup("Minion Units", minionColors);
var blindwaterSolos = new ArmyGroup("Minion Solos", minionColors);
var blindwaterLesserCasters = new ArmyGroup("Minion Lesser Warlocks", minionColors);
blindwaterCasters.models = new Array(getModelById("IW06"),getModelById("IW07"),getModelById("IW09"));
blindwaterWarbeasts.models = new Array(getModelById("IB03"),getModelById("IB04"),getModelById("IB05"),getModelById("IB07"),getModelById("IB08"));
blindwaterUnits.models = new Array(getModelById("IU01"),getModelById("Iu04"),getModelById("IU05"));
blindwaterSolos.models = new Array(getModelById("IS02"),getModelById("IS05"),getModelById("IS07"),getModelById("IS08"),getModelById("IS09"),getModelById("Is11"));
blindwaterLesserCasters.models = new Array(getModelById("IW04"));
blindwaterArmy.groups = new Array(blindwaterCasters, blindwaterWarbeasts, blindwaterUnits, blindwaterSolos, blindwaterLesserCasters);
addArmy(blindwaterArmy);

var minionArmy = new Army("Minions", null, false, [
    thornfallArmy, 
    blindwaterArmy, 
    addWMHTierArmy(new Army("Dr. Arkadius - Mad Science", null, null, false, new Array(new Tier("Only", "IW08 IB01 IB02 IB06 IU02 IU03 IU06 IU07 IW03 IS10", "PC", "IB02--1 Ib02--1", "FA", "IU02--1 IU03--1 IU06--1"),
    		new Tier("Must have", "IU03"),
    		new Tier("Must have", "IU02"),
    		new Tier("Must have", "3IB02")
    		)), minionColors, "Minion"),
    addWMHTierArmy(new Army("Lord Carver - The Golden Horde", null, null, false, new Array(new Tier("Only", "IW05 IB01 IB02 Ib01 Ib02 IB06 Ib06 IU02 IU03 IU06 IU07 IW03 IS10", "FA", "IU03-U IU02--1 IU06--1"),
    		new Tier("Must have", "IW03", "PC", "Ib01--1 Ib02--2 Ib06--2"),   
    		new Tier("Must have", "2IU03", "PC", "IU03--1"),
    		new Tier("Must have", "3(IB01 IB02 IB06)")
    		)), minionColors, "Minion"),
    addWMHTierArmy(new Army("Calaban - Bad Religion", null, null, false, new Array(new Tier("Only", "IW07 IB03 IB04 IB05 IB07 IB08 Ib03 Ib04 Ib05 Ib07 Ib08 IU01 IU02 IU04 IS02 IS09 IS11 IW04"),
    		new Tier("Must have", "IU02"),
    		new Tier("Must have", "IW04", "PC", "Ib03--2 Ib04--1 Ib05--2 Ib07--1 Ib08--2"),
    		new Tier("Must have in battlegroup", "4(IB03 IB04 IB05 IB07 IB08)")
    		)), minionColors, "Minion"),
    addWMHTierArmy(new Army("Bloody Barnabas - Apex Predators", null, null, false, new Array(new Tier("Only", "IW06 IB03 IB04 IB05 IB07 IB08 IU01 Iu04 IS09 IS11 IW04", "FA", "Iu04-U"),
    		new Tier("Must have", "IU01"),
    		new Tier("Must have", "2Iu04"),
    		new Tier("Must have in battlegroup", "3(IB03 IB05 IB08)", "PC", "IB08--1 IB03--1 IB05--1")
    		)), minionColors, "Minion"),
    addWMHTierArmy(new Army("Maelok - The Walking Death", null, null, false, new Array(new Tier("Only", "IW09 IB03 IB04 IB05 IB07 IB08 IU01 IU04 IS11 IS02 IW04", "PC", "IS11--1", "FA", "IS11-+1-IU04|IU01"),
    		new Tier("Must have", "2(IU04 IU01)"),
    		new Tier("Must have", "2IS11"),
    		new Tier("Must have in battlegroup", "3IB07")
    		)), minionColors, "Minion"),
    addWMHTierArmy(new Army("Sturm und Drang - Split Decision", null, null, false, new Array(new Tier("Only", "IW10 IB01 IB02 Ib01 Ib02 IB06 Ib06 IU02 IU03 IU06 IU07 IW03 IS10"),
    		new Tier("Must have", "IS10"),
    		new Tier("Must have", "IU07"),
    		new Tier("Must have", "2IB06", "PC", "IB06--1")
    		)), minionColors, "Minion")
    ]);
addArmy(minionArmy);

systems.push(new System("Hordes", wmhListSizes, [{name:"redrawPoints", value:"wmhRedrawPoints"}, {name:"recalcPoints", value:"wmhRecalcPoints"}, {name:"rebuild", value: "wmhApplyTiers"}, {name:"rebuildModel", value: "wmhRebuildModel"}],
		[circleArmy, everblightArmy, skorneArmy, trollbloodArmy, minionArmy], 
		[circleFaction, everblightFaction, trollbloodFaction, skorneFaction, minionFaction],
		"<p><b>The <a href='http://privateerpress.com/hordes'>Hordes</a> game is owned and copyrighted by the great people at <a href='http://privateerpress.com'>Privateer Press</a>.</b></p>"
		+ "<p>In HORDES, monstrous beasts set upon one another in a bloody clash of tooth and fang that churns the battlefield into a seething sea of carnage. Brought to righteous wrath by the intruding wars of man or their own thirst for conquest, their masters feed on the pain and rage and forge primal energy into a weapon to wield against their enemies. Ash, desolation, and the smoking ruin of once-proud civilizations are all that remains in their wake.</p>"
		+ "<p>Unleash your inner fury and let loose the beasts of war!</p>"
		+ "<p>Set in the wilds of the Iron Kingdoms, HORDES is WARMACHINE's feral twin. In this award-winning, fast-paced, 30mm tabletop miniatures game, players jump into the action controlling powerful battle-wizards known as warlocks. Warlocks are formidable combatants in their own right, but their true strength is drawn from their synergy with packs of savage warbeasts that allow them to contend on equal footing with the greatest modern armies of the Iron Kingdoms. Players collect, assemble, and paint fantastically detailed models representing the varied warriors, minions, and beasts in their hordes. This is monstrous miniatures combat, and your tabletop will never be the same! </p>"
		+ "<p>If you are working at Privateer Press and do not like this text, please contact me (info@fowardkommander.com).</p>"));addModel(new Model("DX01", "Tiny flier group of 3/3/3 and one scout plane", "tiny", "U", new Array(
		new ModelOption("x", "Tiny flier group of 3/3/3 and one scout plane", null, null, [{name:'flyerGroup', value:1}])
), new ChildGroup(3, "DX08 DX09 DX10")));	
addModel(new Model("DX02", "Tiny flier group of 5/5", "tiny", "U", new Array(
		new ModelOption("x", "Tiny flier group of 5/5", null, null, [{name:'flyerGroup', value:1}])
), new ChildGroup(2, "DX08 DX09 DX10")));	
addModel(new Model("DX03", "Tiny flier group of 4/4 and two scout planes", "tiny", "U", new Array(
		new ModelOption("x", "Tiny flier group of 4/4 and two scout planes", null, null, [{name:'flyerGroup', value:1}])
), new ChildGroup(2, "DX08 DX09 DX10")));

addModel(new Model("DX04", "Carrier flier group of 5 and one scout plane", "tiny", "U", new Array(
		new ModelOption("x", "Carrier flier group of 5 and one scout plane", null, null, [{name:'carrierGroup', value:1}])
), new ChildGroup(1, "DX08 DX09 DX10"), true));		
addModel(new Model("DX05", "Carrier flier group of 3/3", "tiny", "U", new Array(
		new ModelOption("x", "Carrier flier group of 3/3", null, null, [{name:'carrierGroup', value:1}])
), new ChildGroup(2, "DX08 DX09 DX10"), true));

addModel(new Model("DX06", "Carrier flier group of 3 and one scout plane", "tiny", "U", new Array(
		new ModelOption("x", "Carrier flier group of 3 and one scout plane", null, null, [{name:'carrierGroup', value:1}])
), new ChildGroup(1, "DX08 DX09 DX10"), true));	
addModel(new Model("DX07", "Carrier flier group of 4", "tiny", "U", new Array(
		new ModelOption("x", "Carrier flier group of 4", null, null, [{name:'carrierGroup', value:1}])
), new ChildGroup(1, "DX08 DX09 DX10"), true));	

addModel(new Model("DX08", "Squadron of Dive bombers", "tiny", "U", new Array(new ModelOption("x", "Dive bomber squadron", null, null, null)), null, true));	
addModel(new Model("DX09", "Squadron of Torpedo bombers", "tiny", "U", new Array(new ModelOption("x", "Torpedo bomber squadron", null, null, null)), null, true));	
addModel(new Model("DX10", "Squadron of Fighters", "tiny", "U", new Array(new ModelOption("x", "Fighter squadron", null, null, null)), null, true));	
var franceColors = new Array("#0000FF","white");
var franceFaction = new Faction("Republique of France", "f", franceColors);
factions.push(franceFaction);

addModel(new Model("fN01", "Magenta Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Magenta Class Battleship", null, new Array('HP',8,'AP',7,'Fuel',4), [{name:'points', value:150}, {name:'large', value:150}])
	)));	
var antarcticaColors = new Array("white","grey");
var antarcticaFaction = new Faction("Covenant of Antarctica", "A", antarcticaColors);
factions.push(antarcticaFaction);

addModel(new Model("AX01", "Battleship Disruption Generator", "tiny", "U", new Array(new ModelOption("1", "Disruption Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("AX02", "Battleship Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("AX03", "Battleship Target Painter", "tiny", "U", new Array(new ModelOption("1", "Target Painter", [], null, [{name: 'points', value: 10}])), null, true));	
addModel(new Model("AX04", "Dreadnought Target Painter", "tiny", "U", new Array(new ModelOption("1", "Target Painter", [], null, [{name: 'points', value: 20}])), null, true));	


addModel(new Model("AN01", "Aristotle Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Aristotle Class Battleship", null, new Array('HP',8,'AP',7), [{name:'points', value:185}, {name:'large', value:185}])
	), [new ChildGroup(1, "AN07"), new ChildGroup(1, "AX01 AX02"), new ChildGroup(1, "AX03")]));	
addModel(new Model("AN02", "Plato Class Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Plato Class Cruisers", [2, "Plato Class Cruiser"], new Array('cruiser 1: HP',4,'AP',4,'cruiser 2: HP',4,'AP',4), [{name:'points', value:130}, {name:'medium', value:130}]),
		new ModelOption("3n", "3 Plato Class Cruisers", [3, "Plato Class Cruiser"], new Array('cruiser 1: HP',4,'AP',4,'cruiser 2: HP',4,'AP',4,'cruiser 3: HP',4,'AP',4), [{name:'points', value:195}, {name:'medium', value:195}])
	)));	
addModel(new Model("AN03", "Diogenes Class Frigate", "small", "U", new Array(
		new ModelOption("2n", "2 Diogenes Class Frigates", [2, "Diogenes Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Diogenes Class Frigates", [3, "Diogenes Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2), [{name:'points', value:75}, {name:'small', value:75}]),
		new ModelOption("4n", "4 Diogenes Class Frigates", [4, "Diogenes Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2,'frigate 4: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("AN04", "Pericles Class Carrier", "massive", "U", new Array(
		new ModelOption("1n", "Pericles Class Carrier", null, new Array('HP',7,'AP',6), [{name:'points', value:130}, {name:'massive', value:130}])
	), [new ChildGroup(1, "AN07"), new ChildGroup(1, "DX04 DX05")] ));	
addModel(new Model("AN05", "Prometheus Class Dreadnought", "large", "U", new Array(
		new ModelOption("1n", "Prometheus Class Dreadnought", null, new Array('HP',10,'AP',10), [{name:'points', value:275}, {name:'large', value:275}])
	), [new ChildGroup(1, "AN07"), new ChildGroup(1, "NX04")]));	
addModel(new Model("AN06", "Thales Class Corvette", "small", "U", new Array(
		new ModelOption("2n", "2 Thales Class Corvettes", [2, "Thales Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Thales Class Corvettes", [3, "Thales Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Thales Class Corvettes", [4, "Thales Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Thales Class Corvettes", [5, "Thales Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1,'corvette 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("AN07", "Galen Class Escort", "small", "U", new Array(
		new ModelOption("1n", "1 Galen Class Escorts", [1, "Galen Class Escort"], new Array('escort 1: HP',2,'AP',1), [{name:'points', value:25}, {name:'small', value:25}]),
		new ModelOption("2n", "2 Galen Class Escorts", [2, "Galen Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Galen Class Escorts", [3, "Galen Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1,'escort 3: HP',2,'AP',1), [{name:'points', value:75}, {name:'small', value:75}])
	), null, true));	
addModel(new Model("AN08", "Plutarch Class Destroyer", "small", "U", new Array(
		new ModelOption("2n", "2 Plutarch Class Destroyers", [2, "Plutarch Class Destroyer"], new Array('destroyer 1: HP',2,'AP',1,'destroyer 2: HP',2,'AP',1), [{name:'points', value:70}, {name:'small', value:70}]),
		new ModelOption("3n", "3 Plutarch Class Destroyers", [3, "Plutarch Class Destroyer"], new Array('destroyer 1: HP',2,'AP',1,'destroyer 2: HP',2,'AP',1,'destroyer 3: HP',2,'AP',1), [{name:'points', value:105}, {name:'small', value:105}]),
		new ModelOption("4n", "4 Plutarch Class Destroyers", [4, "Plutarch Class Destroyer"], new Array('destroyer 1: HP',2,'AP',1,'destroyer 2: HP',2,'AP',1,'destroyer 3: HP',2,'AP',1,'destroyer 4: HP',2,'AP',1), [{name:'points', value:140}, {name:'small', value:140}]),
		new ModelOption("5n", "5 Plutarch Class Destroyers", [5, "Plutarch Class Destroyer"], new Array('destroyer 1: HP',2,'AP',1,'destroyer 2: HP',2,'AP',1,'destroyer 3: HP',2,'AP',1,'destroyer 4: HP',2,'AP',1,'destroyer 5: HP',2,'AP',1), [{name:'points', value:175}, {name:'small', value:175}])
	)));	
addModel(new Model("AN09", "Zeno Class Armoured Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Zeno Class Armoured Cruisers", [2, "Zeno Class Armoured Cruiser"], new Array('cruiser 1: HP',6,'AP',4,'cruiser 2: HP',6,'AP',4), [{name:'points', value:180}, {name:'medium', value:180}]),
		new ModelOption("3n", "3 Zeno Class Armoured Cruisers", [3, "Zeno Class Armoured Cruiser"], new Array('cruiser 1: HP',6,'AP',4,'cruiser 2: HP',6,'AP',4,'cruiser 3: HP',6,'AP',4), [{name:'points', value:270}, {name:'medium', value:270}])
	)));

addModel(new Model("AL01", "Atticus Class Medium Walker", "medium", "U", new Array(
		new ModelOption("2n", "2 Atticus Class Medium Walkers", [2, "Atticus Class Medium Walker"], new Array('tank 1: HP',3,'AP',2,'tank 2: HP',3,'AP',2), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Atticus Class Medium Walkers", [3, "Atticus Class Medium Walker"], new Array('tank 1: HP',3,'AP',2,'tank 2: HP',3,'AP',2,'tank 3: HP',3,'AP',2), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Atticus Class Medium Walkers", [4, "Atticus Class Medium Walker"], new Array('tank 1: HP',3,'AP',2,'tank 2: HP',3,'AP',2,'tank 3: HP',3,'AP',2,'tank 4: HP',3,'AP',2), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("AL02", "Archimedes Class Heavy Walker", "large", "U", new Array(
		new ModelOption("1n", "Archimedes Class Heavy Walker", [1, "Sovereign Class Landship"], new Array('HP',8,'AP',6), [{name:'points', value:125}, {name:'large', value:130}])
	)));	
addModel(new Model("AL03", "Socrates Class Bombard", "medium", "U", new Array(
		new ModelOption("2n", "2 Socrates Class Bombards", [2, "Socrates Class Bombard"], new Array('bombard 1: HP',3,'AP',1,'bombard 2: HP',3,'AP',1), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Socrates Class Bombards", [3, "Socrates Class Bombard"], new Array('bombard 1: HP',3,'AP',1,'bombard 2: HP',3,'AP',1,'bombard 3: HP',3,'AP',1), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("AL04", "Herotudus Mobile Airfield", "massive", "U", new Array(
		new ModelOption("1n", "Herotudus Mobile Airfield", null, new Array('HP',9,'AP',7), [{name:'points', value:135}, {name:'massive', value:135}])
	), new ChildGroup(1, "DX04 DX05")));	
addModel(new Model("AL05", "Xenophon Class Small Walkers", "small", "U", new Array(
		new ModelOption("2n", "2 Xenophon Class Small Walkerss", [2, "Xenophon Class Small Walkers"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Xenophon Class Small Walkerss", [3, "Xenophon Class Small Walkers"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Xenophon Class Small Walkerss", [4, "Xenophon Class Small Walkers"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Xenophon Class Small Walkerss", [5, "Xenophon Class Small Walkers"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1,'tank 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("AL06", "Callimachus Time Dilation Orb", "large", "U", new Array(
		new ModelOption("1n", "Callimachus Time Dilation Orb", null, new Array('HP',7,'AP',6), [{name:'points', value:70}, {name:'large', value:70}])
	)));	

addModel(new Model("AF01", "Ptolemy Class Bomber", "medium", "U", new Array(
		new ModelOption("2n", "2 Ptolemy Class Bombers", [2, "Ptolemy Class Bomber"], new Array('bomber 1: HP',4,'AP',3,'bomber 2: HP',4,'AP',3), [{name:'points', value:110}, {name:'medium', value:110}]),
		new ModelOption("3n", "3 Ptolemy Class Bombers", [3, "Ptolemy Class Bomber"], new Array('bomber 1: HP',4,'AP',3,'bomber 2: HP',4,'AP',3,'bomber 3: HP',4,'AP',3), [{name:'points', value:165}, {name:'medium', value:165}]),
		new ModelOption("4n", "4 Ptolemy Class Bombers", [4, "Ptolemy Class Bomber"], new Array('bomber 1: HP',4,'AP',3,'bomber 2: HP',4,'AP',3,'bomber 3: HP',4,'AP',3,'bomber 4: HP',4,'AP',3), [{name:'points', value:220}, {name:'medium', value:220}])
	)));	
addModel(new Model("AF02", "Icarus Class Medium Flyer", "medium", "U", new Array(
		new ModelOption("2n", "2 Icarus Class Medium Flyers", [2, "Icarus Class Medium Flyer"], new Array('rotor 1: HP',5,'AP',4,'rotor 2: HP',5,'AP',4), [{name:'points', value:140}, {name:'medium', value:140}]),
		new ModelOption("3n", "3 Icarus Class Medium Flyers", [3, "Icarus Class Medium Flyer"], new Array('rotor 1: HP',5,'AP',4,'rotor 2: HP',5,'AP',4,'rotor 3: HP',5,'AP',4), [{name:'points', value:210}, {name:'medium', value:210}])
	)));	
addModel(new Model("AF03", "Daedalus Class Large Flyer", "large", "U", new Array(
		new ModelOption("1n", "Daedalus Class Large Flyer", null, new Array('HP',7,'AP',7), [{name:'points', value:125}, {name:'large', value:125}])
	)));	
addModel(new Model("AF04", "Epicurus Class Sky Fortress", "massive", "U", new Array(
		new ModelOption("1n", "Epicurus Class Sky Fortress", null, new Array('HP',8,'AP',7), [{name:'points', value:130}, {name:'massive', value:150}])
	), new ChildGroup(1, "DX04 DX05")));	

addModel(new Model("AD01", "Comms Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Comms Towers", [2, "Comms Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Comms Towers", [3, "Comms Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4,'tower 3: HP',5,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}])
	)));	
addModel(new Model("AD02", "Flak Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Flak Towers", [2, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Flak Towers", [3, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Flak Towers", [4, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5,'tower 4: HP',7,'AP',5), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("AD03", "Shield Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Shield Towers", [2, "Shield Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Shield Towers", [3, "Shield Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4,'tower 3: HP',5,'AP',4), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("AD04", "Land Torpedo Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Land Torpedo Towers", [2, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5), [{name:'points', value:100}, {name:'medium', value:100}]),
		new ModelOption("3n", "3 Land Torpedo Towers", [3, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("4n", "4 Land Torpedo Towers", [4, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5,'tower 4: HP',7,'AP',5), [{name:'points', value:200}, {name:'medium', value:200}])
	)));
addModel(new Model("AD05", "Bunker", "large", "U", new Array(
		new ModelOption("1n", "Bunker", null, new Array('HP',11,'AP',6), [{name:'points', value:100}, {name:'large', value:100}])
	)));	
addModel(new Model("AD06", "Landing Field", "massive", "U", new Array(
		new ModelOption("1n", "Landing Field", null, new Array('HP',9,'AP',5), [{name:'points', value:90}, {name:'massive', value:90}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("AD07", "Coastal Defence", "massive", "U", new Array(
		new ModelOption("1n", "Coastal Defence", null, new Array('HP',12,'AP',7), [{name:'points', value:150}, {name:'massive', value:150}])
	)));	

var antarcticaArmy = new Army("Covenant of Antarctica", null, true);
var antarcticaTinyFliers = new ArmyGroup("Antarctica Tiny Fliers", antarcticaColors);
var antarcticaNaval = new ArmyGroup("Antarctica Naval", antarcticaColors);
var antarcticaUpgrades = new ArmyGroup("Antarctica Upgrades", antarcticaColors);
var antarcticaLand = new ArmyGroup("Antarctica Land", antarcticaColors);
var antarcticaFlying = new ArmyGroup("Antarctica Flying", antarcticaColors);
var antarcticaDefenses = new ArmyGroup("Antarctica Defenses", antarcticaColors);
antarcticaNaval.models = new Array(getModelById("AN01"), getModelById("AN02"), getModelById("AN03"), getModelById("AN04"), getModelById("AN05"), getModelById("AN06"), getModelById("AN07"), getModelById("AN08"), getModelById("AN09"));
antarcticaUpgrades.models = new Array(getModelById("AX01"), getModelById("AX02"), getModelById("AX03"), getModelById("AX04"));
antarcticaLand.models = new Array(getModelById("AL01"), getModelById("AL02"), getModelById("AL03"), getModelById("AL04"), getModelById("AL05"), getModelById("AL06"));
antarcticaFlying.models = new Array(getModelById("AF01"), getModelById("AF02"), getModelById("AF03"), getModelById("AF04"));
antarcticaTinyFliers.models = new Array(getModelById("DX01"), getModelById("DX02"), getModelById("DX03"), getModelById("DX04"), getModelById("DX05"), getModelById("DX06"), getModelById("DX07"), getModelById("DX08"), getModelById("DX09"), getModelById("DX10"));
antarcticaDefenses.models = new Array(getModelById("AD01"), getModelById("AD02"), getModelById("AD03"), getModelById("AD04"), getModelById("AD05"), getModelById("AD06"), getModelById("AD07"));
antarcticaArmy.groups = new Array(antarcticaNaval, antarcticaUpgrades, antarcticaLand, antarcticaFlying, antarcticaTinyFliers, antarcticaDefenses);
addArmy(antarcticaArmy);


var britaniaColors = new Array("#FF0000","white");
var britaniaFaction = new Faction("Kingdom of Britannia", "B", britaniaColors);
factions.push(britaniaFaction);

addModel(new Model("BX01", "Battleship Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("BX02", "Cruiser Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("BX03", "Dreadnought Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 20}])), null, true));	


addModel(new Model("BN01", "Ruler Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Ruler Class Battleship", null, new Array('HP',8,'AP',6), [{name:'points', value:180}, {name:'large', value:180}])
	), [new ChildGroup(1, "BN07"), new ChildGroup(2, "BX01")]));	
addModel(new Model("BN02", "Tribal Class Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Tribal Class Cruisers", [2, "Tribal Class Cruiser"], new Array('cruiser 1: HP',4,'AP',5,'cruiser 2: HP',4,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Tribal Class Cruisers", [3, "Tribal Class Cruiser"], new Array('cruiser 1: HP',4,'AP',5,'cruiser 2: HP',4,'AP',5,'cruiser 3: HP',4,'AP',5), [{name:'points', value:180}, {name:'medium', value:180}])
	), new ChildGroup(3, "BX02")));	
addModel(new Model("BN03", "Attacker Class Frigate", "small", "U", new Array(
		new ModelOption("2n", "2 Attacker Class Frigates", [2, "Attacker Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Attacker Class Frigates", [3, "Attacker Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2), [{name:'points', value:75}, {name:'small', value:75}]),
		new ModelOption("4n", "4 Attacker Class Frigates", [4, "Attacker Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2,'frigate 4: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("BN04", "Avenger Fleet Carrier", "massive", "U", new Array(
		new ModelOption("1n", "Avenger Fleet Carrier", null, new Array('HP',9,'AP',6), [{name:'points', value:155}, {name:'massive', value:155}])
	), [new ChildGroup(1, "BN07"), new ChildGroup(1, "DX04 DX05")] ));	
addModel(new Model("BN05", "Majesty Class Dreadnought", "large", "U", new Array(
		new ModelOption("1n", "Majesty Class Dreadnought", null, new Array('HP',10,'AP',11), [{name:'points', value:230}, {name:'large', value:230}])
	), [new ChildGroup(1, "BN07"), new ChildGroup(2, "BX03")]));	
addModel(new Model("BN06", "Swift Class Corvette", "small", "U", new Array(
		new ModelOption("2n", "2 Swift Class Corvettes", [2, "Swift Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Swift Class Corvettes", [3, "Swift Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Swift Class Corvettes", [4, "Swift Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Swift Class Corvettes", [5, "Swift Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1,'corvette 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("BN07", "Bastion Class Escort", "small", "U", new Array(
		new ModelOption("1n", "1 Bastion Class Escorts", [1, "Bastion Class Escort"], new Array('escort 1: HP',2,'AP',1), [{name:'points', value:25}, {name:'small', value:25}]),
		new ModelOption("2n", "2 Bastion Class Escorts", [2, "Bastion Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Bastion Class Escorts", [3, "Bastion Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1,'escort 3: HP',2,'AP',1), [{name:'points', value:75}, {name:'small', value:75}])
	), null, true));	
addModel(new Model("BN08", "Orion Class Destroyer", "small", "U", new Array(
		new ModelOption("2n", "2 Orion Class Destroyers", [2, "Orion Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2), [{name:'points', value:70}, {name:'small', value:70}]),
		new ModelOption("3n", "3 Orion Class Destroyers", [3, "Orion Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2), [{name:'points', value:105}, {name:'small', value:105}]),
		new ModelOption("4n", "4 Orion Class Destroyers", [4, "Orion Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2,'destroyer 4: HP',2,'AP',2), [{name:'points', value:140}, {name:'small', value:140}])
	)));	
addModel(new Model("BN09", "Agincount Class Gunship", "medium", "U", new Array(
		new ModelOption("2n", "2 Agincount Class Gunships", [2, "Agincount Class Gunship"], new Array('gunship 1: HP',5,'AP',5,'gunship 2: HP',5,'AP',5), [{name:'points', value:160}, {name:'medium', value:160}]),
		new ModelOption("3n", "3 Agincount Class Gunships", [3, "Agincount Class Gunship"], new Array('gunship 1: HP',5,'AP',5,'gunship 2: HP',5,'AP',5,'gunship 3: HP',5,'AP',5), [{name:'points', value:240}, {name:'medium', value:240}])
	)));
addModel(new Model("BN10", "Vanguard Class Submarine", "medium", "U", new Array(
		new ModelOption("2n", "2 Vanguard Class Submarines", [2, "Vanguard Class Submarine"], new Array('submarine 1: HP',4,'AP',4,'submarine 2: HP',4,'AP',4), [{name:'points', value:110}, {name:'medium', value:110}]),
		new ModelOption("3n", "3 Vanguard Class Submarines", [3, "Vanguard Class Submarine"], new Array('submarine 1: HP',4,'AP',4,'submarine 2: HP',4,'AP',4,'submarine 3: HP',4,'AP',4), [{name:'points', value:165}, {name:'medium', value:165}])
	)));	

addModel(new Model("BL01", "MK II Class Tank", "medium", "U", new Array(
		new ModelOption("2n", "2 MK II Class Tanks", [2, "MK II Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 MK II Class Tanks", [3, "MK II Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 MK II Class Tanks", [4, "MK II Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3,'tank 4: HP',3,'AP',3), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("BL02", "Sovereign Class Landship (Turrets)", "large", "U", new Array(
		new ModelOption("1n", "Sovereign Class Landship (Turrets)", [1, "Sovereign Class Landship"], new Array('HP',7,'AP',6), [{name:'points', value:125}, {name:'large', value:125}])
	)));	
addModel(new Model("Bl02", "Sovereign Class Landship (Mortars)", "large", "U", new Array(
		new ModelOption("1n", "Sovereign Class Landship (Mortars)", [1, "Sovereign Class Landship"], new Array('HP',7,'AP',6), [{name:'points', value:110}, {name:'large', value:110}])
	)));	
addModel(new Model("Bx02", "Sovereign Class Landship (Cathedral HQ)", "large", "U", new Array(
		new ModelOption("1n", "Sovereign Class Landship (Cathedral HQ)", [1, "Sovereign Class Landship"], new Array('HP',7,'AP',6), [{name:'points', value:90}, {name:'large', value:90}])
	)));	
addModel(new Model("BL03", "Cromwell Class Bombard", "medium", "U", new Array(
		new ModelOption("2n", "2 Cromwell Class Bombards", [2, "Cromwell Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Cromwell Class Bombards", [3, "Cromwell Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2,'bombard 3: HP',3,'AP',2), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("BL04", "Brunel Mobile Airfield", "massive", "U", new Array(
		new ModelOption("1n", "Brunel Mobile Airfield", null, new Array('HP',9,'AP',7), [{name:'points', value:150}, {name:'massive', value:150}])
	), new ChildGroup(1, "DX04 DX05")));	
addModel(new Model("BL05", "Terrier Class Small Tank", "small", "U", new Array(
		new ModelOption("2n", "2 Terrier Class Small Tanks", [2, "Terrier Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Terrier Class Small Tanks", [3, "Terrier Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Terrier Class Small Tanks", [4, "Terrier Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Terrier Class Small Tanks", [5, "Terrier Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1,'tank 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	

addModel(new Model("BF01", "Doncaster Class Bomber", "medium", "U", new Array(
		new ModelOption("2n", "2 Doncaster Class Bombers", [2, "Doncaster Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Doncaster Class Bombers", [3, "Doncaster Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4,'bomber 3: HP',4,'AP',4), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("BF02", "Hawk Class Scout Rotor", "medium", "U", new Array(
		new ModelOption("2n", "2 Hawk Class Scout Rotors", [2, "Hawk Class Scout Rotor"], new Array('rotor 1: HP',5,'AP',5,'rotor 2: HP',5,'AP',5), [{name:'points', value:140}, {name:'medium', value:140}]),
		new ModelOption("3n", "3 Hawk Class Scout Rotors", [3, "Hawk Class Scout Rotor"], new Array('rotor 1: HP',5,'AP',5,'rotor 2: HP',5,'AP',5,'rotor 3: HP',5,'AP',5), [{name:'points', value:210}, {name:'medium', value:210}]),
		new ModelOption("4n", "4 Hawk Class Scout Rotors", [4, "Hawk Class Scout Rotor"], new Array('rotor 1: HP',5,'AP',5,'rotor 2: HP',5,'AP',5,'rotor 3: HP',5,'AP',5,'rotor 4: HP',5,'AP',5), [{name:'points', value:280}, {name:'medium', value:280}])
	)));	
addModel(new Model("BF03", "Eagle Class War Rotor", "large", "U", new Array(
		new ModelOption("1n", "Eagle Class War Rotor", null, new Array('HP',8,'AP',8), [{name:'points', value:120}, {name:'large', value:120}])
	)));	
addModel(new Model("BF04", "Illustrious Class Sky Fortress", "massive", "U", new Array(
		new ModelOption("1n", "Illustrious Class Sky Fortress", null, new Array('HP',9,'AP',7), [{name:'points', value:140}, {name:'massive', value:140}])
	), new ChildGroup(1, "DX04 DX05")));	

addModel(new Model("BD01", "Comms Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Comms Towers", [2, "Comms Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Comms Towers", [3, "Comms Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4,'tower 3: HP',5,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}])
	)));	
addModel(new Model("BD02", "Flak Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Flak Towers", [2, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Flak Towers", [3, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Flak Towers", [4, "Flak Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5,'tower 4: HP',7,'AP',5), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("BD03", "Shield Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Shield Towers", [2, "Shield Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Shield Towers", [3, "Shield Tower"], new Array('tower 1: HP',5,'AP',4,'tower 2: HP',5,'AP',4,'tower 3: HP',5,'AP',4), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("BD04", "Land Torpedo Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Land Torpedo Towers", [2, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5), [{name:'points', value:100}, {name:'medium', value:100}]),
		new ModelOption("3n", "3 Land Torpedo Towers", [3, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("4n", "4 Land Torpedo Towers", [4, "Land Torpedo Tower"], new Array('tower 1: HP',7,'AP',5,'tower 2: HP',7,'AP',5,'tower 3: HP',7,'AP',5,'tower 4: HP',7,'AP',5), [{name:'points', value:200}, {name:'medium', value:200}])
	)));
addModel(new Model("BD05", "Bunker", "large", "U", new Array(
		new ModelOption("1n", "Bunker", null, new Array('HP',11,'AP',6), [{name:'points', value:100}, {name:'large', value:100}])
	)));	
addModel(new Model("BD06", "Landing Field", "massive", "U", new Array(
		new ModelOption("1n", "Landing Field", null, new Array('HP',9,'AP',5), [{name:'points', value:90}, {name:'massive', value:90}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("BD07", "Coastal Defence", "massive", "U", new Array(
		new ModelOption("1n", "Coastal Defence", null, new Array('HP',12,'AP',7), [{name:'points', value:150}, {name:'massive', value:150}])
	)));	

var britaniaArmy = new Army("Kingdom of Britania", null, true);
var britaniaTinyFliers = new ArmyGroup("Britania Tiny Fliers", britaniaColors);
var britaniaNaval = new ArmyGroup("Britania Naval", britaniaColors);
var britaniaUpgrades = new ArmyGroup("Britania Upgrades", britaniaColors);
var britaniaLand = new ArmyGroup("Britania Land", britaniaColors);
var britaniaFlying = new ArmyGroup("Britania Flying", britaniaColors);
var britaniaDefenses = new ArmyGroup("Britania Defenses", britaniaColors);
britaniaNaval.models = new Array(getModelById("BN01"), getModelById("BN02"), getModelById("BN03"), getModelById("BN04"), getModelById("BN05"), getModelById("BN06"), getModelById("BN07"), getModelById("BN08"), getModelById("BN09"), getModelById("BN10"));
britaniaUpgrades.models = new Array(getModelById("BX01"), getModelById("BX02"), getModelById("BX03"));
britaniaLand.models = new Array(getModelById("BL01"), getModelById("BL02"), getModelById("Bl02"), getModelById("Bx02"), getModelById("BL03"), getModelById("BL04"), getModelById("BL05"));
britaniaFlying.models = new Array(getModelById("BF01"), getModelById("BF02"), getModelById("BF03"), getModelById("BF04"));
britaniaTinyFliers.models = new Array(getModelById("DX01"), getModelById("DX02"), getModelById("DX03"), getModelById("DX04"), getModelById("DX05"), getModelById("DX06"), getModelById("DX07"), getModelById("DX08"), getModelById("DX09"), getModelById("DX10"));
britaniaDefenses.models = new Array(getModelById("BD01"), getModelById("BD02"), getModelById("BD03"), getModelById("BD04"), getModelById("BD05"), getModelById("BD06"), getModelById("BD07"));
britaniaArmy.groups = new Array(britaniaNaval, britaniaUpgrades, britaniaLand, britaniaFlying, britaniaTinyFliers, britaniaDefenses);
addArmy(britaniaArmy);


var prussiaColors = new Array("black","white");
var prussiaFaction = new Faction("Prussian Empire", "p", prussiaColors);
factions.push(prussiaFaction);

addModel(new Model("pX01", "Battleship UPG/Calcification Generator", "tiny", "U", new Array(new ModelOption("1", "UPG/Calcification Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("pX02", "Battleship Tesla Generator", "tiny", "U", new Array(new ModelOption("1", "Tesla Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("pX03", "Battleship Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("pX04", "Cruiser Lethal Strike", "tiny", "U", new Array(new ModelOption("1", "1 Lethal Strike Upgrade", [], null, [{name: 'points', value: 5}])), null, true));	
addModel(new Model("pX05", "Dreadnought UPG/Calcification Generator", "tiny", "U", new Array(new ModelOption("1", "UPG/Calcification Generator", [], null, [{name: 'points', value: 20}])), null, true));	
addModel(new Model("pX06", "Dreadnought Tesla Generator", "tiny", "U", new Array(new ModelOption("1", "Tesla Generator", [], null, [{name: 'points', value: 20}])), null, true));	
addModel(new Model("pX07", "Dreadnought Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 20}])), null, true));	

addModel(new Model("pN01", "Emperor Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Emperor Class Battleship", null, new Array('HP',8,'AP',10), [{name:'points', value:170}, {name:'large', value:170}])
	), [new ChildGroup(1, "pN07"), new ChildGroup(1, "pX01 pX02 pX03")]));	
addModel(new Model("pN02", "Reiver Class Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Reiver Class Cruisers", [2, "Reiver Class Cruiser"], new Array('cruiser 1: HP',4,'AP',6,'cruiser 2: HP',4,'AP',6), [{name:'points', value:130}, {name:'medium', value:130}]),
		new ModelOption("3n", "3 Reiver Class Cruisers", [3, "Reiver Class Cruiser"], new Array('cruiser 1: HP',4,'AP',6,'cruiser 2: HP',4,'AP',6,'cruiser 3: HP',4,'AP',6), [{name:'points', value:195}, {name:'medium', value:195}])
	)));	
addModel(new Model("pN03", "Arminius Class Frigate", "small", "U", new Array(
		new ModelOption("2n", "2 Arminius Class Frigates", [2, "Arminius Class Frigate"], new Array('frigate 1: HP',2,'AP',3,'frigate 2: HP',2,'AP',3), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Arminius Class Frigates", [3, "Arminius Class Frigate"], new Array('frigate 1: HP',2,'AP',3,'frigate 2: HP',2,'AP',3,'frigate 3: HP',2,'AP',3), [{name:'points', value:75}, {name:'small', value:75}]),
		new ModelOption("4n", "4 Arminius Class Frigates", [4, "Arminius Class Frigate"], new Array('frigate 1: HP',2,'AP',3,'frigate 2: HP',2,'AP',3,'frigate 3: HP',2,'AP',3,'frigate 4: HP',2,'AP',3), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("pN04", "Rhine Fleet Carrier", "massive", "U", new Array(
		new ModelOption("1n", "Rhine Fleet Carrier", null, new Array('HP',7,'AP',7), [{name:'points', value:125}, {name:'massive', value:125}])
	), [new ChildGroup(1, "pN07"), new ChildGroup(1, "DX04 DX05")]));	
addModel(new Model("pN05", "Blucher Class Dreadnought", "large", "U", new Array(
		new ModelOption("1n", "Blucher Class Dreadnought", null, new Array('HP',10,'AP',12), [{name:'points', value:235}, {name:'large', value:235}])
	), [new ChildGroup(1, "pN07"), new ChildGroup(2, "pX04 pX05 pX06")]));	
addModel(new Model("pN06", "Saxony Class Corvette", "small", "U", new Array(
		new ModelOption("2n", "2 Saxony Class Corvettes", [2, "Saxony Class Corvette"], new Array('corvette 1: HP',2,'AP',2,'corvette 2: HP',2,'AP',2), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Saxony Class Corvettes", [3, "Saxony Class Corvette"], new Array('corvette 1: HP',2,'AP',2,'corvette 2: HP',2,'AP',2,'corvette 3: HP',2,'AP',2), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Saxony Class Corvettes", [4, "Saxony Class Corvette"], new Array('corvette 1: HP',2,'AP',2,'corvette 2: HP',2,'AP',2,'corvette 3: HP',2,'AP',2,'corvette 4: HP',2,'AP',2), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Saxony Class Corvettes", [5, "Saxony Class Corvette"], new Array('corvette 1: HP',2,'AP',2,'corvette 2: HP',2,'AP',2,'corvette 3: HP',2,'AP',2,'corvette 4: HP',2,'AP',2,'corvette 5: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("pN07", "Wachter Class Escort", "small", "U", new Array(
		new ModelOption("1n", "1 Wachter Class Escorts", [1, "Wachter Class Escort"], new Array('escort 1: HP',2,'AP',2), [{name:'points', value:20}, {name:'small', value:20}]),
		new ModelOption("2n", "2 Wachter Class Escorts", [2, "Wachter Class Escort"], new Array('escort 1: HP',2,'AP',2,'escort 2: HP',2,'AP',2), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Wachter Class Escorts", [3, "Wachter Class Escort"], new Array('escort 1: HP',2,'AP',2,'escort 2: HP',2,'AP',2,'escort 3: HP',2,'AP',2), [{name:'points', value:60}, {name:'small', value:60}])
	), null, true));	
addModel(new Model("pN08", "Stolz Class Destroyer", "small", "U", new Array(
		new ModelOption("2n", "2 Stolz Class Destroyers", [2, "Stolz Class Destroyer"], new Array('destroyer 1: HP',2,'AP',3,'destroyer 2: HP',2,'AP',3), [{name:'points', value:70}, {name:'small', value:70}]),
		new ModelOption("3n", "3 Stolz Class Destroyers", [3, "Stolz Class Destroyer"], new Array('destroyer 1: HP',2,'AP',3,'destroyer 2: HP',2,'AP',3,'destroyer 3: HP',2,'AP',3), [{name:'points', value:105}, {name:'small', value:105}]),
		new ModelOption("4n", "4 Stolz Class Destroyers", [4, "Stolz Class Destroyer"], new Array('destroyer 1: HP',2,'AP',3,'destroyer 2: HP',2,'AP',3,'destroyer 3: HP',2,'AP',3,'destroyer 4: HP',2,'AP',3), [{name:'points', value:140}, {name:'small', value:140}])
	)));	
addModel(new Model("pN09", "Hussar Class Gunship", "medium", "U", new Array(
		new ModelOption("2n", "2 Hussar Class Gunships", [2, "Hussar Class Gunship"], new Array('gunship 1: HP',5,'AP',5,'gunship 2: HP',5,'AP',5), [{name:'points', value:170}, {name:'medium', value:170}]),
		new ModelOption("3n", "3 Hussar Class Gunships", [3, "Hussar Class Gunship"], new Array('gunship 1: HP',5,'AP',5,'gunship 2: HP',5,'AP',5,'gunship 3: HP',5,'AP',5), [{name:'points', value:255}, {name:'medium', value:255}])
	)));

addModel(new Model("pL01", "A6-V Medium Tank", "medium", "U", new Array(
		new ModelOption("2n", "2 A6-V Medium Tanks", [2, "A6-V Medium Tank"], new Array('tank 1: HP',3,'AP',4,'tank 2: HP',3,'AP',4), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 A6-V Medium Tanks", [3, "A6-V Medium Tank"], new Array('tank 1: HP',3,'AP',4,'tank 2: HP',3,'AP',4,'tank 3: HP',3,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 A6-V Medium Tanks", [4, "A6-V Medium Tank"], new Array('tank 1: HP',3,'AP',4,'tank 2: HP',3,'AP',4,'tank 3: HP',3,'AP',4,'tank 4: HP',3,'AP',4), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("pL02", "A9-V Sturmpanzer", "large", "U", new Array(
		new ModelOption("1n", "A9-V Sturmpanzer", null, new Array('HP',8,'AP',8), [{name:'points', value:150}, {name:'large', value:150}])
	)));	
addModel(new Model("pL03", "B3-S Medium Bombard", "medium", "U", new Array(
		new ModelOption("2n", "2 B3-S Medium Bombards", [2, "B3-S Medium Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 B3-S Medium Bombards", [3, "B3-S Medium Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2,'bombard 3: HP',3,'AP',2), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("pL04", "Mobile Airfield", "massive", "U", new Array(
		new ModelOption("1n", "Mobile Airfield", null, new Array('HP',10,'AP',9), [{name:'points', value:150}, {name:'massive', value:150}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("pL05", "Walze Class Small Tank", "small", "U", new Array(
		new ModelOption("2n", "2 Walze Class Small Tanks", [2, "Walze Class Small Tank"], new Array('tank 1: HP',2,'AP',2,'tank 2: HP',2,'AP',2), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Walze Class Small Tanks", [3, "Walze Class Small Tank"], new Array('tank 1: HP',2,'AP',2,'tank 2: HP',2,'AP',2,'tank 3: HP',2,'AP',2), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Walze Class Small Tanks", [4, "Walze Class Small Tank"], new Array('tank 1: HP',2,'AP',2,'tank 2: HP',2,'AP',2,'tank 3: HP',2,'AP',2,'tank 4: HP',2,'AP',2), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Walze Class Small Tanks", [5, "Walze Class Small Tank"], new Array('tank 1: HP',2,'AP',2,'tank 2: HP',2,'AP',2,'tank 3: HP',2,'AP',2,'tank 4: HP',2,'AP',2,'tank 5: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("pL06", "Metzger Class Robot", "large", "U", new Array(
		new ModelOption("1n", "Metzger Class Robot", null, new Array('HP',6,'AP',8), [{name:'points', value:90}, {name:'large', value:90}])
	)));	

addModel(new Model("pF01", "Geier Class Bomber", "medium", "U", new Array(
		new ModelOption("2n", "2 Geier Class Bombers", [2, "Geier Class Bomber"], new Array('bomber 1: HP',4,'AP',5,'bomber 2: HP',4,'AP',5), [{name:'points', value:110}, {name:'medium', value:110}]),
		new ModelOption("3n", "3 Geier Class Bombers", [3, "Geier Class Bomber"], new Array('bomber 1: HP',4,'AP',5,'bomber 2: HP',4,'AP',5,'bomber 3: HP',4,'AP',5), [{name:'points', value:165}, {name:'medium', value:165}])
	)));	
addModel(new Model("pF02", "Pflicht Class Scoutship", "medium", "U", new Array(
		new ModelOption("2n", "2 Pflicht Class Scoutships", [2, "Pflicht Class Scoutship"], new Array('scoutship 1: HP',5,'AP',6,'scoutship 2: HP',5,'AP',6), [{name:'points', value:130}, {name:'medium', value:130}]),
		new ModelOption("3n", "3 Pflicht Class Scoutships", [3, "Pflicht Class Scoutship"], new Array('scoutship 1: HP',5,'AP',6,'scoutship 2: HP',5,'AP',6,'scoutship 3: HP',5,'AP',6), [{name:'points', value:195}, {name:'medium', value:195}]),
		new ModelOption("4n", "4 Pflicht Class Scoutships", [4, "Pflicht Class Scoutship"], new Array('scoutship 1: HP',5,'AP',6,'scoutship 2: HP',5,'AP',6,'scoutship 3: HP',5,'AP',6,'scoutship 4: HP',5,'AP',6), [{name:'points', value:260}, {name:'medium', value:260}])
	)));	
addModel(new Model("pF03", "Gewitterwolke Airship", "large", "U", new Array(
		new ModelOption("1n", "Gewitterwolke Airship", null, new Array('HP',8,'AP',7), [{name:'points', value:115}, {name:'large', value:115}])
	)));	
addModel(new Model("pF04", "Imperium Sky Fortress", "massive", "U", new Array(
		new ModelOption("1n", "Imperium Sky Fortress", null, new Array('HP',10,'AP',9), [{name:'points', value:135}, {name:'massive', value:135}])
	), new ChildGroup(1, "DX04 DX05")));	

addModel(new Model("pD01", "Comms Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Comms Towers", [2, "Comms Tower"], new Array('tower 1: HP',4,'AP',5,'tower 2: HP',4,'AP',5), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Comms Towers", [3, "Comms Tower"], new Array('tower 1: HP',4,'AP',5,'tower 2: HP',4,'AP',5,'tower 3: HP',4,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}])
	)));	
addModel(new Model("pD02", "Flak Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Flak Towers", [2, "Flak Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Flak Towers", [3, "Flak Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6,'tower 3: HP',6,'AP',6), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Flak Towers", [4, "Flak Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6,'tower 3: HP',6,'AP',6,'tower 4: HP',6,'AP',6), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("pD03", "Shield Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Shield Towers", [2, "Shield Tower"], new Array('tower 1: HP',4,'AP',5,'tower 2: HP',4,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Shield Towers", [3, "Shield Tower"], new Array('tower 1: HP',4,'AP',5,'tower 2: HP',4,'AP',5,'tower 3: HP',4,'AP',5), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("pD04", "Tesla Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Tesla Towers", [2, "Tesla Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6), [{name:'points', value:100}, {name:'medium', value:100}]),
		new ModelOption("3n", "3 Tesla Towers", [3, "Tesla Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6,'tower 3: HP',6,'AP',6), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("4n", "4 Tesla Towers", [4, "Tesla Tower"], new Array('tower 1: HP',6,'AP',6,'tower 2: HP',6,'AP',6,'tower 3: HP',6,'AP',6,'tower 4: HP',6,'AP',6), [{name:'points', value:200}, {name:'medium', value:200}])
	)));
addModel(new Model("pD05", "Bunker", "large", "U", new Array(
		new ModelOption("1n", "Bunker", null, new Array('HP',9,'AP',8), [{name:'points', value:130}, {name:'large', value:130}])
	)));	
addModel(new Model("pD06", "Landing Field", "massive", "U", new Array(
		new ModelOption("1n", "Landing Field", null, new Array('HP',9,'AP',7), [{name:'points', value:90}, {name:'massive', value:90}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("pD07", "Coastal Defence", "massive", "U", new Array(
		new ModelOption("1n", "Coastal Defence", null, new Array('HP',10,'AP',9), [{name:'points', value:150}, {name:'massive', value:150}])
	)));	

var prussiaArmy = new Army("Prussian Empire", null, true);
var prussiaNaval = new ArmyGroup("Prussian Naval", prussiaColors);
var prussiaUpgrades = new ArmyGroup("Prussian Upgrades", prussiaColors);
var prussiaLand = new ArmyGroup("Prussian Land", prussiaColors);
var prussiaFlying = new ArmyGroup("Prussian Flying", prussiaColors);
var prussianTinyFliers = new ArmyGroup("Prussian Tiny Fliers", prussiaColors);
var prussiaDefenses = new ArmyGroup("Prussian Defenses", prussiaColors);
var prussiaFranceAllies = new ArmyGroup("Republique of France Allies", franceColors);
prussiaNaval.models = new Array(getModelById("pN01"), getModelById("pN02"), getModelById("pN03"), getModelById("pN04"), getModelById("pN05"), getModelById("pN06"), getModelById("pN07"), getModelById("pN08"), getModelById("pN09"));
prussiaUpgrades.models = new Array(getModelById("pX01"), getModelById("pX02"), getModelById("pX03"), getModelById("pX04"), getModelById("pX05"), getModelById("pX06"), getModelById("pX07"));
prussiaLand.models = new Array(getModelById("pL01"), getModelById("pL02"), getModelById("pL03"), getModelById("pL04"), getModelById("pL05"), getModelById("pL06"));
prussiaFlying.models = new Array(getModelById("pF01"), getModelById("pF02"), getModelById("pF03"), getModelById("pF04"));
prussianTinyFliers.models = new Array(getModelById("DX01"), getModelById("DX02"), getModelById("DX03"), getModelById("DX04"), getModelById("DX05"), getModelById("DX06"), getModelById("DX07"), getModelById("DX08"), getModelById("DX09"), getModelById("DX10"));
prussiaDefenses.models = new Array(getModelById("pD01"), getModelById("pD02"), getModelById("pD03"), getModelById("pD04"), getModelById("pD05"), getModelById("pD06"), getModelById("pD07"));
prussiaFranceAllies.models = new Array(getModelById("fN01"));
prussiaArmy.groups = new Array(prussiaNaval, prussiaUpgrades, prussiaLand, prussiaFlying, prussianTinyFliers, prussiaDefenses, prussiaFranceAllies);
addArmy(prussiaArmy);


var blazingSunColors = new Array("#FF0000","white");
var blazingSunFaction = new Faction("Empire of the Blazing Sun", "b", blazingSunColors);
factions.push(blazingSunFaction);

addModel(new Model("bX01", "Battleship Disruption Generator", "tiny", "U", new Array(new ModelOption("1", "Disruption Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("bX02", "Battleship Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("bX03", "Cruiser Incendary Rockets", "tiny", "U", new Array(new ModelOption("1", "Incendary Rockets", [], null, [{name: 'points', value: 5}])), null, true));	
addModel(new Model("bX04", "Dreadnought Disruption Generator", "tiny", "U", new Array(new ModelOption("1", "Disruption Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("bX05", "Dreadnought Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("bX06", "Mobile Airfield Disruption Generator", "tiny", "U", new Array(new ModelOption("1", "Disruption Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("bX07", "Mobile Airfield Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	

addModel(new Model("bN01", "Sokotsu Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Sokotsu Class Battleship", null, new Array('HP',8,'AP',10), [{name:'points', value:180}, {name:'large', value:180}])
	), [new ChildGroup(1, "bN07"), new ChildGroup(1, "bX01 bX02")]));	
addModel(new Model("bN02", "Nakatsu Class Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Nakatsu Class Cruisers", [2, "Nakatsu Class Cruiser"], new Array('cruiser 1: HP',4,'AP',5,'cruiser 2: HP',4,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Nakatsu Class Cruisers", [3, "Nakatsu Class Cruiser"], new Array('cruiser 1: HP',4,'AP',5,'cruiser 2: HP',4,'AP',5,'cruiser 3: HP',4,'AP',5), [{name:'points', value:180}, {name:'medium', value:180}]),
		new ModelOption("4n", "4 Nakatsu Class Cruisers", [4, "Nakatsu Class Cruiser"], new Array('cruiser 1: HP',4,'AP',5,'cruiser 2: HP',4,'AP',5,'cruiser 3: HP',4,'AP',5,'cruiser 4: HP',4,'AP',5), [{name:'points', value:240}, {name:'medium', value:240}])
	), new ChildGroup(3, "bX03")));	
addModel(new Model("bN03", "Uwatsu Class Frigate", "small", "U", new Array(
		new ModelOption("2n", "2 Uwatsu Class Frigates", [2, "Uwatsu Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Uwatsu Class Frigates", [3, "Uwatsu Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2), [{name:'points', value:75}, {name:'small', value:75}]),
		new ModelOption("4n", "4 Uwatsu Class Frigates", [4, "Uwatsu Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2,'frigate 4: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("bN04", "Kiyohime Class Assault Carrier", "massive", "U", new Array(
		new ModelOption("1n", "Kiyohime Class Assault Carrier", null, new Array('HP',7,'AP',7), [{name:'points', value:130}, {name:'massive', value:130}])
	), [new ChildGroup(1, "bN07"), new ChildGroup(1, "DX06 DX07")] ));	
addModel(new Model("bN05", "Hachiman Class Dreadnought", "large", "U", new Array(
		new ModelOption("1n", "Hachiman Class Dreadnought", null, new Array('HP',10,'AP',12), [{name:'points', value:235}, {name:'large', value:235}])
	), [new ChildGroup(1, "bN07"), new ChildGroup(2, "bX04 bX05")]));	
addModel(new Model("bN06", "Fujin Class Corvette", "small", "U", new Array(
		new ModelOption("2n", "2 Fujin Class Corvettes", [2, "Fujin Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Fujin Class Corvettes", [3, "Fujin Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Fujin Class Corvettes", [4, "Fujin Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Fujin Class Corvettes", [5, "Fujin Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1,'corvette 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("bN07", "Kitsune Class Escort", "small", "U", new Array(
		new ModelOption("1n", "1 Kitsune Class Escorts", [1, "Kitsune Class Escort"], new Array('escort 1: HP',2,'AP',1), [{name:'points', value:20}, {name:'small', value:20}]),
		new ModelOption("2n", "2 Kitsune Class Escorts", [2, "Kitsune Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Kitsune Class Escorts", [3, "Kitsune Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1,'escort 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}])
	), null, true));	
addModel(new Model("bN08", "Yurgi Class Destroyer", "small", "U", new Array(
		new ModelOption("2n", "2 Yurgi Class Destroyers", [2, "Yurgi Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("3n", "3 Yurgi Class Destroyers", [3, "Yurgi Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2), [{name:'points', value:90}, {name:'small', value:90}]),
		new ModelOption("4n", "4 Yurgi Class Destroyers", [4, "Yurgi Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2,'destroyer 4: HP',2,'AP',2), [{name:'points', value:120}, {name:'small', value:120}])
	)));	
addModel(new Model("bN09", "Tanuki Class Gunship", "medium", "U", new Array(
		new ModelOption("2n", "2 Tanuki Class Gunships", [2, "Tanuki Class Gunship"], new Array('gunship 1: HP',6,'AP',6,'gunship 2: HP',6,'AP',6), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("3n", "3 Tanuki Class Gunships", [3, "Tanuki Class Gunship"], new Array('gunship 1: HP',6,'AP',6,'gunship 2: HP',6,'AP',6,'gunship 3: HP',6,'AP',6), [{name:'points', value:225}, {name:'medium', value:225}])
	)));
addModel(new Model("bN10", "Mechanical Ika", "large", "U", new Array(
		new ModelOption("1n", "1 Mechanical Ika", [1, "Mechanical Ika"], new Array('squid 1: HP',6,'AP',9), [{name:'points', value:100}, {name:'large', value:100}]),
		new ModelOption("2n", "2 Mechanical Ika", [2, "Mechanical Ika"], new Array('squid 1: HP',6,'AP',9,'squid 2: HP',6,'AP',9), [{name:'points', value:200}, {name:'large', value:200}])
	), new ChildGroup(1, "bN07")));	

addModel(new Model("bL01", "Type II Chi-Ri Class Tank", "medium", "U", new Array(
		new ModelOption("2n", "2 Type II Chi-Ri Class Tanks", [2, "Type II Chi-Ri Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Type II Chi-Ri Class Tanks", [3, "Type II Chi-Ri Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Type II Chi-Ri Class Tanks", [4, "Type II Chi-Ri Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3,'tank 4: HP',3,'AP',3), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("bL02", "O-I Taka-Ashi Heavy Walker (Turret)", "large", "U", new Array(
		new ModelOption("1n", "O-I Taka-Ashi Heavy Walker (Turret)", [1, "O-I Taka-Ashi Heavy Walker"], new Array('HP',7,'AP',8), [{name:'points', value:150}, {name:'large', value:150}])
	)));	
addModel(new Model("bl02", "O-I Taka-Ashi Heavy Walker (Icon)", "large", "U", new Array(
		new ModelOption("1n", "O-I Taka-Ashi Heavy Walker (Icon)", [1, "O-I Taka-Ashi Heavy Walker"], new Array('HP',7,'AP',8), [{name:'points', value:115}, {name:'large', value:115}])
	)));	
addModel(new Model("bL03", "Ho-I Class Bombard", "medium", "U", new Array(
		new ModelOption("2n", "2 Ho-I Class Bombards", [2, "Ho-I Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Ho-I Class Bombards", [3, "Ho-I Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2,'bombard 3: HP',3,'AP',2), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("bL04", "Mobile Airfield", "massive", "U", new Array(
		new ModelOption("1n", "Mobile Airfield", null, new Array('HP',9,'AP',8), [{name:'points', value:135}, {name:'massive', value:135}])
	), [new ChildGroup(1, "DX04 DX05"),new ChildGroup(1, "bX06 bX07")]));	
addModel(new Model("bL05", "Ke-Ho Class Small Tank", "small", "U", new Array(
		new ModelOption("2n", "2 Ke-Ho Class Small Tanks", [2, "Ke-Ho Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Ke-Ho Class Small Tanks", [3, "Ke-Ho Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Ke-Ho Class Small Tanks", [4, "Ke-Ho Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Ke-Ho Class Small Tanks", [5, "Ke-Ho Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1,'tank 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	

addModel(new Model("bF01", "DFA-170 Class Bomber", "medium", "U", new Array(
		new ModelOption("2n", "2 DFA-170 Class Bombers", [2, "DFA-170 Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 DFA-170 Class Bombers", [3, "DFA-170 Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4,'bomber 3: HP',4,'AP',4), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("bF02", "Inari Class Scout Gyro", "medium", "U", new Array(
		new ModelOption("2n", "2 Inari Class Scout Gyros", [2, "Inari Class Scout Gyro"], new Array('gyro 1: HP',5,'AP',5,'gyro 2: HP',5,'AP',5), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("3n", "3 Inari Class Scout Gyros", [3, "Inari Class Scout Gyro"], new Array('gyro 1: HP',5,'AP',5,'gyro 2: HP',5,'AP',5,'gyro 3: HP',5,'AP',5), [{name:'points', value:225}, {name:'medium', value:225}]),
		new ModelOption("4n", "4 Inari Class Scout Gyros", [4, "Inari Class Scout Gyro"], new Array('gyro 1: HP',5,'AP',5,'gyro 2: HP',5,'AP',5,'gyro 3: HP',5,'AP',5,'gyro 4: HP',5,'AP',5), [{name:'points', value:300}, {name:'medium', value:300}])
	)));	
addModel(new Model("bF03", "Tsukuyomi Class War Gyro", "large", "U", new Array(
		new ModelOption("1n", "Tsukuyomi Class War Gyro", null, new Array('HP',7,'AP',7), [{name:'points', value:150}, {name:'large', value:150}])
	)));	
addModel(new Model("bF04", "Tenkei Sky Fortress", "massive", "U", new Array(
		new ModelOption("1n", "Tenkei Sky Fortress", null, new Array('HP',9,'AP',8), [{name:'points', value:135}, {name:'massive', value:135}])
	), new ChildGroup(1, "DX04 DX05")));	

addModel(new Model("bD01", "Comms Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Comms Towers", [2, "Comms Tower"], new Array('tower 1: HP',4,'AP',3,'tower 2: HP',4,'AP',3), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Comms Towers", [3, "Comms Tower"], new Array('tower 1: HP',4,'AP',3,'tower 2: HP',4,'AP',3,'tower 3: HP',4,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}])
	)));	
addModel(new Model("bD02", "Flak Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Flak Towers", [2, "Flak Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Flak Towers", [3, "Flak Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4,'tower 3: HP',6,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Flak Towers", [4, "Flak Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4,'tower 3: HP',6,'AP',4,'tower 4: HP',6,'AP',4), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("bD03", "Shield Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Shield Towers", [2, "Shield Tower"], new Array('tower 1: HP',4,'AP',3,'tower 2: HP',4,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Shield Towers", [3, "Shield Tower"], new Array('tower 1: HP',4,'AP',3,'tower 2: HP',4,'AP',3,'tower 3: HP',4,'AP',3), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("bD04", "Rocket Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Rocket Towers", [2, "Rocket Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4), [{name:'points', value:100}, {name:'medium', value:100}]),
		new ModelOption("3n", "3 Rocket Towers", [3, "Rocket Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4,'tower 3: HP',6,'AP',4), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("4n", "4 Rocket Towers", [4, "Rocket Tower"], new Array('tower 1: HP',6,'AP',4,'tower 2: HP',6,'AP',4,'tower 3: HP',6,'AP',4,'tower 4: HP',6,'AP',4), [{name:'points', value:200}, {name:'medium', value:200}])
	)));
addModel(new Model("bD05", "Bunker", "large", "U", new Array(
		new ModelOption("1n", "Bunker", null, new Array('HP',8,'AP',6), [{name:'points', value:130}, {name:'large', value:130}])
	)));	
addModel(new Model("bD06", "Landing Field", "massive", "U", new Array(
		new ModelOption("1n", "Landing Field", null, new Array('HP',8,'AP',6), [{name:'points', value:90}, {name:'massive', value:90}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("bD07", "Coastal Defence", "massive", "U", new Array(
		new ModelOption("1n", "Coastal Defence", null, new Array('HP',9,'AP',7), [{name:'points', value:170}, {name:'massive', value:170}])
	)));	

var blazingSunArmy = new Army("Empire of the Blazing Sun", null, true);
var blazingSunTinyFliers = new ArmyGroup("Rising Sun Tiny Fliers", blazingSunColors);
var blazingSunNaval = new ArmyGroup("Rising Sun Naval", blazingSunColors);
var blazingSunUpgrades = new ArmyGroup("Rising Sun Upgrades", blazingSunColors);
var blazingSunLand = new ArmyGroup("Rising Sun Land", blazingSunColors);
var blazingSunFlying = new ArmyGroup("Rising Sun Flying", blazingSunColors);
var blazingSunDefenses = new ArmyGroup("Rising Sun Defenses", blazingSunColors);
var blazingSunFranceAllies = new ArmyGroup("Republique of France Allies", franceColors);
blazingSunNaval.models = new Array(getModelById("bN01"), getModelById("bN02"), getModelById("bN03"), getModelById("bN04"), getModelById("bN05"), getModelById("bN06"), getModelById("bN07"), getModelById("bN08"), getModelById("bN09"), getModelById("bN10"));
blazingSunUpgrades.models = new Array(getModelById("bX01"), getModelById("bX02"), getModelById("bX03"));
blazingSunLand.models = new Array(getModelById("bL01"), getModelById("bL02"), getModelById("bl02"), getModelById("bL03"), getModelById("bL04"), getModelById("bL05"));
blazingSunFlying.models = new Array(getModelById("bF01"), getModelById("bF02"), getModelById("bF03"), getModelById("bF04"));
blazingSunTinyFliers.models = new Array(getModelById("DX01"), getModelById("DX02"), getModelById("DX03"), getModelById("DX04"), getModelById("DX05"), getModelById("DX06"), getModelById("DX07"), getModelById("DX08"), getModelById("DX09"), getModelById("DX10"));
blazingSunDefenses.models = new Array(getModelById("bD01"), getModelById("bD02"), getModelById("bD03"), getModelById("bD04"), getModelById("bD05"), getModelById("bD06"), getModelById("bD07"));
blazingSunFranceAllies.models = new Array(getModelById("fN01"));
blazingSunArmy.groups = new Array(blazingSunNaval, blazingSunUpgrades, blazingSunLand, blazingSunFlying, blazingSunTinyFliers, blazingSunDefenses, blazingSunFranceAllies);
addArmy(blazingSunArmy);var fsaColors = new Array("#FF0000","white");
var fsaFaction = new Faction("Federated States of America", "F", fsaColors);
factions.push(fsaFaction);

addModel(new Model("FX01", "Battleship Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("FX02", "Battleship Kinetic Generator", "tiny", "U", new Array(new ModelOption("1", "Kinetic Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("FX03", "Cruiser Sharpshooters", "tiny", "U", new Array(new ModelOption("1", "Sharpshooters", [], null, [{name: 'points', value: 5}])), null, true));	
addModel(new Model("FX04", "Cruiser Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("FX05", "Cruiser Kinetic Generator", "tiny", "U", new Array(new ModelOption("1", "Kinetic Generator", [], null, [{name: 'points', value: 0}])), null, true));	
addModel(new Model("FX06", "Dreadnought Shield Generator", "tiny", "U", new Array(new ModelOption("1", "Shield Generator", [], null, [{name: 'points', value: 20}])), null, true));	
addModel(new Model("FX07", "Dreadnought Kinetic Generator", "tiny", "U", new Array(new ModelOption("1", "Kinetic Generator", [], null, [{name: 'points', value: 20}])), null, true));	

addModel(new Model("FN01", "Independance Class Battleship", "large", "U", new Array(
		new ModelOption("1n", "Independance Class Battleship", null, new Array('HP',8,'AP',9), [{name:'points', value:180}, {name:'large', value:180}])
	), [new ChildGroup(1, "FN07"), new ChildGroup(1, "FX01 FX02")]));	
addModel(new Model("FN02", "Lexington Class Cruiser", "medium", "U", new Array(
		new ModelOption("2n", "2 Lexington Class Cruisers", [2, "Lexington Class Cruiser"], new Array('cruiser 1: HP',4,'AP',6,'cruiser 2: HP',4,'AP',6), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Lexington Class Cruisers", [3, "Lexington Class Cruiser"], new Array('cruiser 1: HP',4,'AP',6,'cruiser 2: HP',4,'AP',6,'cruiser 3: HP',4,'AP',6), [{name:'points', value:180}, {name:'medium', value:180}])
	), [new ChildGroup(3, "FX03"), new ChildGroup(3, "FX04 FX05")]));	
addModel(new Model("FN03", "Augusta Class Frigate", "small", "U", new Array(
		new ModelOption("2n", "2 Augusta Class Frigates", [2, "Augusta Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2), [{name:'points', value:50}, {name:'small', value:50}]),
		new ModelOption("3n", "3 Augusta Class Frigates", [3, "Augusta Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2), [{name:'points', value:75}, {name:'small', value:75}]),
		new ModelOption("4n", "4 Augusta Class Frigates", [4, "Augusta Class Frigate"], new Array('frigate 1: HP',2,'AP',2,'frigate 2: HP',2,'AP',2,'frigate 3: HP',2,'AP',2,'frigate 4: HP',2,'AP',2), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("FN04", "Saratoga Fleet Carrier", "massive", "U", new Array(
		new ModelOption("1n", "Saratoga Fleet Carrier", null, new Array('HP',8,'AP',6), [{name:'points', value:105}, {name:'massive', value:105}])
	), [new ChildGroup(1, "FN07"), new ChildGroup(1, "DX04 DX05")]));	
addModel(new Model("FN05", "Enterprise Class Dreadnought", "large", "U", new Array(
		new ModelOption("1n", "Enterprise Class Dreadnought", null, new Array('HP',10,'AP',11), [{name:'points', value:230}, {name:'large', value:230}])
	), [new ChildGroup(1, "FN07"), new ChildGroup(2, "FX06 FX07")]));	
addModel(new Model("FN06", "Revere Class Corvette", "small", "U", new Array(
		new ModelOption("2n", "2 Revere Class Corvettes", [2, "Revere Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Revere Class Corvettes", [3, "Revere Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Revere Class Corvettes", [4, "Revere Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Revere Class Corvettes", [5, "Revere Class Corvette"], new Array('corvette 1: HP',2,'AP',1,'corvette 2: HP',2,'AP',1,'corvette 3: HP',2,'AP',1,'corvette 4: HP',2,'AP',1,'corvette 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}])
	)));	
addModel(new Model("FN07", "Springfield Class Escort", "small", "U", new Array(
		new ModelOption("1n", "1 Springfield Class Escorts", [1, "Fastion Class Escort"], new Array('escort 1: HP',2,'AP',1), [{name:'points', value:20}, {name:'small', value:20}]),
		new ModelOption("2n", "2 Springfield Class Escorts", [2, "Fastion Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Springfield Class Escorts", [3, "Fastion Class Escort"], new Array('escort 1: HP',2,'AP',1,'escort 2: HP',2,'AP',1,'escort 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}])
	), null, true));	
addModel(new Model("FN08", "Guilford Class Destroyer", "small", "U", new Array(
		new ModelOption("2n", "2 Guilford Class Destroyers", [2, "Guilford Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2), [{name:'points', value:70}, {name:'small', value:70}]),
		new ModelOption("3n", "3 Guilford Class Destroyers", [3, "Guilford Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2), [{name:'points', value:105}, {name:'small', value:105}]),
		new ModelOption("4n", "4 Guilford Class Destroyers", [4, "Guilford Class Destroyer"], new Array('destroyer 1: HP',2,'AP',2,'destroyer 2: HP',2,'AP',2,'destroyer 3: HP',2,'AP',2,'destroyer 4: HP',2,'AP',2), [{name:'points', value:140}, {name:'small', value:140}])
	)));	
addModel(new Model("FN09", "Princeton Class Gunship", "medium", "U", new Array(
		new ModelOption("2n", "2 Princeton Class Gunships", [2, "Princeton Class Gunship"], new Array('gunship 1: HP',5,'AP',6,'gunship 2: HP',5,'AP',6), [{name:'points', value:170}, {name:'medium', value:170}]),
		new ModelOption("3n", "3 Princeton Class Gunships", [3, "Princeton Class Gunship"], new Array('gunship 1: HP',5,'AP',6,'gunship 2: HP',5,'AP',6,'gunship 3: HP',5,'AP',6), [{name:'points', value:255}, {name:'medium', value:255}])
	)));

addModel(new Model("FL01", "Trenton Class Tank", "medium", "U", new Array(
		new ModelOption("2n", "2 Trenton Class Tanks", [2, "Trenton Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Trenton Class Tanks", [3, "Trenton Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Trenton Class Tanks", [4, "Trenton Class Tank"], new Array('tank 1: HP',3,'AP',3,'tank 2: HP',3,'AP',3,'tank 3: HP',3,'AP',3,'tank 4: HP',3,'AP',3), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("FL02", "Washington Class Landship", "large", "U", new Array(
		new ModelOption("1n", "Washington Class Landship", [1, "Washington Class Landship"], new Array('HP',7,'AP',7), [{name:'points', value:130}, {name:'large', value:130}])
	)));	
addModel(new Model("FL03", "Yorktown Class Bombard", "medium", "U", new Array(
		new ModelOption("2n", "2 Yorktown Class Bombards", [2, "Yorktown Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Yorktown Class Bombards", [3, "Yorktown Class Bombard"], new Array('bombard 1: HP',3,'AP',2,'bombard 2: HP',3,'AP',2,'bombard 3: HP',3,'AP',2), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("FL04", "Mobile Airfield", "massive", "U", new Array(
		new ModelOption("1n", "Mobile Airfield", null, new Array('HP',9,'AP',8), [{name:'points', value:150}, {name:'massive', value:150}])
	), new ChildGroup(1, "DX04 DX05")));	
addModel(new Model("FL05", "Pioneer Class Small Tank", "small", "U", new Array(
		new ModelOption("2n", "2 Pioneer Class Small Tanks", [2, "Pioneer Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1), [{name:'points', value:40}, {name:'small', value:40}]),
		new ModelOption("3n", "3 Pioneer Class Small Tanks", [3, "Pioneer Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1), [{name:'points', value:60}, {name:'small', value:60}]),
		new ModelOption("4n", "4 Pioneer Class Small Tanks", [4, "Pioneer Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1), [{name:'points', value:80}, {name:'small', value:80}]),
		new ModelOption("5n", "5 Pioneer Class Small Tanks", [5, "Pioneer Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1,'tank 5: HP',2,'AP',1), [{name:'points', value:100}, {name:'small', value:100}]),
		new ModelOption("6n", "6 Pioneer Class Small Tanks", [6, "Pioneer Class Small Tank"], new Array('tank 1: HP',2,'AP',1,'tank 2: HP',2,'AP',1,'tank 3: HP',2,'AP',1,'tank 4: HP',2,'AP',1,'tank 5: HP',2,'AP',1,'tank 6: HP',2,'AP',1), [{name:'points', value:120}, {name:'small', value:120}])
	)));	

addModel(new Model("FF01", "A-17 Class Bomber", "medium", "U", new Array(
		new ModelOption("2n", "2 A-17 Class Bombers", [2, "A-17 Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4), [{name:'points', value:110}, {name:'medium', value:110}]),
		new ModelOption("3n", "3 A-17 Class Bombers", [3, "A-17 Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4,'bomber 3: HP',4,'AP',4), [{name:'points', value:165}, {name:'medium', value:165}]),
		new ModelOption("4n", "4 A-17 Class Bombers", [4, "A-17 Class Bomber"], new Array('bomber 1: HP',4,'AP',4,'bomber 2: HP',4,'AP',4,'bomber 3: HP',4,'AP',4,'bomber 4: HP',4,'AP',4), [{name:'points', value:220}, {name:'medium', value:220}])
	)));	
addModel(new Model("FF02", "Lee Class Scoutship", "medium", "U", new Array(
		new ModelOption("2n", "2 Lee Class Scoutships", [2, "Lee Class Scoutship"], new Array('scoutship 1: HP',5,'AP',5,'scoutship 2: HP',5,'AP',5), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Lee Class Scoutships", [3, "Lee Class Scoutship"], new Array('scoutship 1: HP',5,'AP',5,'scoutship 2: HP',5,'AP',5,'scoutship 3: HP',5,'AP',5), [{name:'points', value:180}, {name:'medium', value:180}]),
		new ModelOption("4n", "4 Lee Class Scoutships", [4, "Lee Class Scoutship"], new Array('scoutship 1: HP',5,'AP',5,'scoutship 2: HP',5,'AP',5,'scoutship 3: HP',5,'AP',5,'scoutship 4: HP',5,'AP',5), [{name:'points', value:240}, {name:'medium', value:240}])
	)));	
addModel(new Model("FF03", "Valley Class Airship", "large", "U", new Array(
		new ModelOption("1n", "Valley Class Airship", null, new Array('HP',8,'AP',8), [{name:'points', value:130}, {name:'large', value:130}])
	)));	
addModel(new Model("FF04", "Savannah Sky Fortress", "massive", "U", new Array(
		new ModelOption("1n", "Savannah Sky Fortress", null, new Array('HP',10,'AP',9), [{name:'points', value:140}, {name:'massive', value:140}])
	), new ChildGroup(1, "DX04 DX05")));	
addModel(new Model("FF05", "John Henry Class Robot", "medium", "U", new Array(
		new ModelOption("2n", "2 John Henry Class Robot", [2, "John Henry Class Robot"], new Array('robot 1: HP',4,'AP',6,'robot 2: HP',4,'AP',6), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 John Henry Class Robot", [3, "John Henry Class Robot"], new Array('robot 1: HP',4,'AP',6,'robot 2: HP',4,'AP',6,'robot 3: HP',4,'AP',6), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	

addModel(new Model("FD01", "Comms Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Comms Towers", [2, "Comms Tower"], new Array('tower 1: HP',5,'AP',3,'tower 2: HP',5,'AP',3), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Comms Towers", [3, "Comms Tower"], new Array('tower 1: HP',5,'AP',3,'tower 2: HP',5,'AP',3,'tower 3: HP',5,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}])
	)));	
addModel(new Model("FD02", "Flak Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Flak Towers", [2, "Flak Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4), [{name:'points', value:80}, {name:'medium', value:80}]),
		new ModelOption("3n", "3 Flak Towers", [3, "Flak Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4,'tower 3: HP',7,'AP',4), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("4n", "4 Flak Towers", [4, "Flak Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4,'tower 3: HP',7,'AP',4,'tower 4: HP',7,'AP',4), [{name:'points', value:160}, {name:'medium', value:160}])
	)));	
addModel(new Model("FD03", "Shield Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Shield Towers", [2, "Shield Tower"], new Array('tower 1: HP',5,'AP',3,'tower 2: HP',5,'AP',3), [{name:'points', value:120}, {name:'medium', value:120}]),
		new ModelOption("3n", "3 Shield Towers", [3, "Shield Tower"], new Array('tower 1: HP',5,'AP',3,'tower 2: HP',5,'AP',3,'tower 3: HP',5,'AP',3), [{name:'points', value:180}, {name:'medium', value:180}])
	)));	
addModel(new Model("FD04", "Gun Tower", "medium", "U", new Array(
		new ModelOption("2n", "2 Gun Towers", [2, "Gun Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4), [{name:'points', value:100}, {name:'medium', value:100}]),
		new ModelOption("3n", "3 Gun Towers", [3, "Gun Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4,'tower 3: HP',7,'AP',4), [{name:'points', value:150}, {name:'medium', value:150}]),
		new ModelOption("4n", "4 Gun Towers", [4, "Gun Tower"], new Array('tower 1: HP',7,'AP',4,'tower 2: HP',7,'AP',4,'tower 3: HP',7,'AP',4,'tower 4: HP',7,'AP',4), [{name:'points', value:200}, {name:'medium', value:200}])
	)));
addModel(new Model("FD05", "Bunker", "large", "U", new Array(
		new ModelOption("1n", "Bunker", null, new Array('HP',9,'AP',7), [{name:'points', value:130}, {name:'large', value:130}])
	)));	
addModel(new Model("FD06", "Landing Field", "massive", "U", new Array(
		new ModelOption("1n", "Landing Field", null, new Array('HP',9,'AP',5), [{name:'points', value:90}, {name:'massive', value:90}])
	), new ChildGroup(1, "DX06 DX07")));	
addModel(new Model("FD07", "Coastal Defence", "massive", "U", new Array(
		new ModelOption("1n", "Coastal Defence", null, new Array('HP',10,'AP',8), [{name:'points', value:165}, {name:'massive', value:165}])
	)));	

var fsaArmy = new Army("Federated States of America", null, true);
var fsaTinyFliers = new ArmyGroup("FSA Tiny Fliers", fsaColors);
var fsaNaval = new ArmyGroup("FSA Naval", fsaColors);
var fsaUpgrades = new ArmyGroup("FSA Upgrades", fsaColors);
var fsaLand = new ArmyGroup("FSA Land", fsaColors);
var fsaFlying = new ArmyGroup("FSA Flying", fsaColors);
var fsaDefenses = new ArmyGroup("FSA Defenses", fsaColors);
var fsaFranceAllies = new ArmyGroup("Republique of France Allies", franceColors);
fsaNaval.models = new Array(getModelById("FN01"), getModelById("FN02"), getModelById("FN03"), getModelById("FN04"), getModelById("FN05"), getModelById("FN06"), getModelById("FN07"), getModelById("FN08"), getModelById("FN09"));
fsaUpgrades.models = new Array(getModelById("FX01"), getModelById("FX02"), getModelById("FX03"), getModelById("FX04"), getModelById("FX05"), getModelById("FX06"), getModelById("FX07"));
fsaLand.models = new Array(getModelById("FL01"), getModelById("FL02"), getModelById("FL03"), getModelById("FL04"), getModelById("FL05"));
fsaFlying.models = new Array(getModelById("FF01"), getModelById("FF02"), getModelById("FF03"), getModelById("FF04"), getModelById("FF05"));
fsaTinyFliers.models = new Array(getModelById("DX01"), getModelById("DX02"), getModelById("DX03"), getModelById("DX04"), getModelById("DX05"), getModelById("DX06"), getModelById("DX07"), getModelById("DX08"), getModelById("DX09"), getModelById("DX10"));
fsaDefenses.models = new Array(getModelById("FD01"), getModelById("FD02"), getModelById("FD03"), getModelById("FD04"), getModelById("FD05"), getModelById("FD06"), getModelById("FD07"));
fsaFranceAllies.models = new Array(getModelById("fN01"));
fsaArmy.groups = new Array(fsaNaval, fsaUpgrades, fsaLand, fsaFlying, fsaTinyFliers, fsaDefenses, fsaFranceAllies);
addArmy(fsaArmy);var dwListSizes = new Array(
		new ListSize("Tiny (500pts)", [{name: 'points', value:500}]),
		new ListSize("Small (750pts)", [{name: 'points', value:750}]),
		new ListSize("Medium (1000pts)", [{name: 'points', value:1000}]),
		new ListSize("Large (1500pts)", [{name: 'points', value:1500}]),
		new ListSize("Huge (2000pts)", [{name: 'points', value:2000}]));

function dwRedrawPoints() {
	var html = '';
	var maxPoints = listSize.get("points");

	var currentPoints = armyTree.getLabelValue("points");
	var errorPoints = (currentPoints > maxPoints);
	html += "<div"+((errorPoints)?" class='error'":"")+"><span class='label'>Points:</span> "+currentPoints+"/"+maxPoints+"</div>";

	var smallPoints = armyTree.getLabelValue("small");
	var smallPercentage = parseInt(smallPoints/maxPoints*10000)/100;
	var smallError = smallPercentage > 40; 
	html += "<div"+((smallError)?" class='error'":"")+"><span class='label'>Small:</span> "+(smallPercentage)+"%</div>";
	
	var mediumPoints = armyTree.getLabelValue("medium");
	var mediumPercentage = parseInt(mediumPoints/maxPoints*10000)/100;
	var mediumError = mediumPercentage > 70; 
	html += "<div"+((mediumError)?" class='error'":"")+"><span class='label'>Medium:</span> "+(mediumPercentage)+"%</div>";

	var largePoints = armyTree.getLabelValue("large");
	var largePercentage = parseInt(largePoints/maxPoints*10000)/100;
	var largeError = largePercentage > 70; 
	html += "<div"+((largeError)?" class='error'":"")+"><span class='label'>Large:</span> "+(largePercentage)+"%</div>";

	var massivePoints = armyTree.getLabelValue("massive");
	var massivePercentage = parseInt(massivePoints/maxPoints*10000)/100;
	var massiveError = massivePercentage > 70; 
	html += "<div"+((massiveError)?" class='error'":"")+"><span class='label'>Massive:</span> "+(massivePercentage)+"%</div></div>";

	document.getElementById("info").innerHTML = html;
}

systems.push(new System("Dystopian Wars", dwListSizes, [{name:"redrawPoints", value:"dwRedrawPoints"}],
		[antarcticaArmy, britaniaArmy, prussiaArmy, blazingSunArmy, fsaArmy], [franceFaction, antarcticaFaction, britaniaFaction, prussiaFaction, blazingSunFaction, fsaFaction],
		"<p><b>The <a href='http://www.spartangames.co.uk/dystopian_wars_home.html'>Dystopian Wars</a> game is owned and copyrighted by the great people at <a href='http://www.spartangames.co.uk/'>Spartan Games</a>.</b></p>"
		+ "<p>Imagine a world similar to our own, but subtly different. Now imagine the year is 1870 and the Industrial Revolution occurred decades earlier than in our own world. Technology is far advanced, and in many cases, unrecognisable, which has led to the development of fantastic naval vessels, hulking land ships and terror from the skies in the form of airships and war balloons.</p>"
		+ "<p>The Dystopian Wars game is set in a Victorian Steampunk world and we have designed the rules to ensure a fun game with a large selection of high quality models in a couple of hours. The rules support Naval, Aerial and Land models from the outset, so that you can set up battles and scenarios in any combat setting.</p>"
		+ "<p>If you are working at Spartan Games and do not like this text, please contact me (info@fowardkommander.com).</p>"));
