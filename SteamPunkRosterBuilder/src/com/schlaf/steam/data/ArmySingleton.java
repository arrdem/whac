package com.schlaf.steam.data;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import android.util.Log;

public class ArmySingleton {

	private static final String TAG = "ArmySingleton";
	
	private static ArmySingleton instance;
	
	/** existing army-lists */
	private List<Army> armies;
	
	/** static data from rulebook <br>
	 * key = faction_id <br>
	 * value = Faction
	 * @see Faction
	 */
	private HashMap<String, Faction> factions;
	
	boolean computed = false;
	
	boolean fullyLoaded = false; // true when loaded + imported files loaded.
	
	/**
	 * the full static data for all codices<br>
	 * key = model_Id <br>
	 * value = ArmyElement
	 */
	private HashMap<String, ArmyElement> armyElements;
	
	private List<Tier> tiers;
	
	private List<Contract> contracts;
	
	
	public List<Contract> getContracts() {
		return contracts;
	}

	private ArmySingleton() {
		armies = new ArrayList<Army>(15);
		factions = new HashMap<String, Faction>(15);
		armyElements = new HashMap<String, ArmyElement>(1500);
		tiers = new ArrayList<Tier>(50);
		contracts = new ArrayList<Contract>(20);
	}
	
	public static final ArmySingleton getInstance() {
		if (instance == null) {
			instance = new ArmySingleton();
		}
		return instance;
	}
	
	/**
	 * iterate over faction models for a full-list army elements
	 */
	public void computeArmyElements() {
		if (!computed) {
			computeElements();
		}
		computed = true;
	}

	private void computeElements() {
		for (Faction faction : factions.values()) {
			for (Warcaster caster : faction.getCasters().values()) {
				armyElements.put(caster.getId(), caster);
			}
			for (Warlock warlock : faction.getWarlocks().values()) {
				armyElements.put(warlock.getId(), warlock);
			}
			for (Warjack jack : faction.getJacks().values()) {
				armyElements.put(jack.getId(), jack);
			}
			for (Warbeast beast : faction.getBeasts().values()) {
				armyElements.put(beast.getId(), beast);
			}
			for (BattleEngine be : faction.getBattleEngines().values()) {
				armyElements.put(be.getId(), be);
			}
			for (Unit unit : faction.getUnits().values()) {
				armyElements.put(unit.getId(), unit);
				
				if (unit.getUnitAttachment() != null) {
					UnitAttachment ua = unit.getUnitAttachment();
					armyElements.put(ua.getId(), ua);
				}
				
				if (unit.getWeaponAttachment() != null) {
					WeaponAttachment wa = unit.getWeaponAttachment();
					armyElements.put(wa.getId(), wa);
				}
			}
			for (Solo solo : faction.getSolos().values()) {
				armyElements.put(solo.getId(), solo);
			}
		}
	}
	
	/**
	 * iterate over faction models for a full-list army elements
	 */
	public void recomputeArmyElements() {
		computeElements();
		computed = true;
		fullyLoaded = true;
		
	}


	public List<Army> getArmies() {
		return armies;
	}

	public void setArmies(List<Army> armies) {
		this.armies = armies;
	}

	public HashMap<String, Faction> getFactions() {
		return factions;
	}

	public void setFactions(HashMap<String, Faction> factions) {
		this.factions = factions;
	}

	public HashMap<String, ArmyElement> getArmyElements() {
		return armyElements;
	}
	
	public ArmyElement getArmyElement(String id) {
		ArmyElement result = armyElements.get(id);
		if (result == null) {
			Log.w(TAG, "getArmyElement  for : " + id + " not found");
		}
				
		return armyElements.get(id);
	}

	public void setArmyElements(HashMap<String, ArmyElement> armyElements) {
		this.armyElements = armyElements;
	}

	public List<Tier> getTiers() {
		return tiers;
	}
	
	public List<Tier> getTiers(FactionNamesEnum faction) {
		ArrayList<Tier> result = new ArrayList<Tier>();
		for (Tier tier : tiers) {
			if (tier.getFactionId().equals(faction.getId())) {
				result.add(tier);
			}
		}
		return result;
	}
	
	public Tier getTier(String tierId) {
		for (Tier tier : tiers) {
			if (tier.getId().equals(tierId)) {
				return tier;
			}
		}
		return  null;
	}
	
	public Contract getContract(String contractId) {
		for (Contract contract : contracts) {
			if (contract.getContractId().equals(contractId)) {
				return contract;
			}
		}
		return  null;
	}
	
	public List<Contract> getContracts(FactionNamesEnum faction) {
		ArrayList<Contract> result = new ArrayList<Contract>();
		for (Contract contract : contracts) {
			if (contract.getFactionId().equals(faction.getId())) {
				result.add(contract);
			}
		}
		return result;
	}

	public boolean isFullyLoaded() {
		return fullyLoaded;
	}
}
