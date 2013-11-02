package com.schlaf.steam.activities.card;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

import com.schlaf.steam.activities.selectlist.selection.SelectionEntry;
import com.schlaf.steam.data.Faction;
import com.schlaf.steam.data.ModelTypeEnum;

public class CardLibrarySingleton {

	private static  CardLibrarySingleton singleton = new CardLibrarySingleton();
	
	private Faction faction;
	private ModelTypeEnum entryType;
	
	HashMap<Faction, HashMap<ModelTypeEnum, List<LabelValueBean>>> entries = new HashMap<Faction, HashMap<ModelTypeEnum,List<LabelValueBean>>>();
	
	public static CardLibrarySingleton getInstance() {
		return singleton;
	}
	
	private CardLibrarySingleton() {
		
	}

	public Faction getFaction() {
		return faction;
	}

	public void setFaction(Faction faction) {
		this.faction = faction;
		refreshEntryList();
	}

	public ModelTypeEnum getEntryType() {
		return entryType;
	}

	public void setEntryType(ModelTypeEnum entryType) {
		this.entryType = entryType;
	}
	
	public List<LabelValueBean> getEntries() {
		if ( entries.get(faction) != null) {
			if (entries.get(faction).get(entryType) != null) {
				return entries.get(faction).get(entryType);
			}
		}
		return new ArrayList<LabelValueBean>();
	}
	
	
	private void refreshEntryList() {
		
		if (entries.get(faction) == null) {
			
			HashMap<ModelTypeEnum, List<LabelValueBean>> map = new HashMap<ModelTypeEnum, List<LabelValueBean>>();
			entries.put(faction, map);
			
			List<SelectionEntry> selectionEntries = faction.getAvailableModelsOfFaction();
			for (SelectionEntry entry : selectionEntries) {
				
				if (map.get(entry.getType()) == null) {
					List<LabelValueBean> entriesList = new ArrayList<LabelValueBean>();
					map.put(entry.getType(), entriesList);
				}
				map.get(entry.getType()).add(new LabelValueBean(entry.getId(), entry.getFullLabel()));
			}
			
			for (List<LabelValueBean> list : map.values()) {
				Collections.sort(list);	
			}
			
		}
		
	}

	public List<ModelTypeEnum> getNonEmptyEntryType() {
		List<ModelTypeEnum> result = new ArrayList<ModelTypeEnum>();
		if (entries.get(faction) != null) {
			for (ModelTypeEnum type : entries.get(faction).keySet()) {
				if (! entries.get(faction).get(type).isEmpty() ) {
					result.add(type);
				}
			}
		}
		Collections.sort(result);
		return result;
	}
	
}
