/**
 * 
 */
package com.schlaf.steam.activities.selectlist;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.NoSuchElementException;

import android.util.Log;

import com.schlaf.steam.activities.selectlist.selected.BeastCommander;
import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.JackMarshall;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedBattleEngine;
import com.schlaf.steam.activities.selectlist.selected.SelectedCasterAttachment;
import com.schlaf.steam.activities.selectlist.selected.SelectedDragoon;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedJourneyManWarcaster;
import com.schlaf.steam.activities.selectlist.selected.SelectedLesserWarlock;
import com.schlaf.steam.activities.selectlist.selected.SelectedModel;
import com.schlaf.steam.activities.selectlist.selected.SelectedRankingOfficer;
import com.schlaf.steam.activities.selectlist.selected.SelectedSolo;
import com.schlaf.steam.activities.selectlist.selected.SelectedSoloMarshal;
import com.schlaf.steam.activities.selectlist.selected.SelectedUA;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnitMarshall;
import com.schlaf.steam.activities.selectlist.selected.SelectedWA;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarbeast;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarcaster;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarjack;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarlock;
import com.schlaf.steam.activities.selectlist.selection.SelectionEntry;
import com.schlaf.steam.activities.selectlist.selection.SelectionSolo;
import com.schlaf.steam.activities.selectlist.selection.SelectionUA;
import com.schlaf.steam.activities.selectlist.selection.SelectionUnit;
import com.schlaf.steam.activities.selectlist.selection.SelectionWA;
import com.schlaf.steam.data.ArmyCommander;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Contract;
import com.schlaf.steam.data.Faction;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.data.ModelTypeEnum;
import com.schlaf.steam.data.Tier;
import com.schlaf.steam.data.TierBenefit;
import com.schlaf.steam.data.TierCostAlteration;
import com.schlaf.steam.data.TierEntry;
import com.schlaf.steam.data.TierEntryGroup;
import com.schlaf.steam.data.TierFAAlteration;
import com.schlaf.steam.data.TierFACostBenefit;
import com.schlaf.steam.data.TierFreeModel;
import com.schlaf.steam.data.TierLevel;
import com.schlaf.steam.data.Warbeast;
import com.schlaf.steam.data.Warjack;

/**
 * @author S0085289
 * 
 */
public class SelectionModelSingleton {

	private static SelectionModelSingleton instance;

	
	private FactionNamesEnum faction;

	private List<SelectionEntry> selectionEntries = new ArrayList<SelectionEntry>(
			100);

	private List<SelectedEntry> selectedEntries = new ArrayList<SelectedEntry>(
			100);

	private ArmyElement currentlyViewedElement;
	
	/**
	 * army file name
	 */
	private String armyFileName;
	
	private static final String UNTITLED_FILE_NAME = "Untitled";

	
	/**
	 * indicates that current army is saved
	 */
	private boolean saved;
	
	/** nominal caster number to select */
	private int nbCasters;
	/** nominal point format */
	private int nbPoints;

	/** tiers description */
	private Tier currentTiers = null; // Tier.generateMockTiers();
	
	/** current contract (if mercenary or minion) */
	private Contract currentContract = null;
	
	/** current tiers level */
	private int currentTiersLevel;
	
	private boolean tierLevelJustChanged = false;
	
	
	private SelectionModelSingleton() {
		// rien
	}

	public static final SelectionModelSingleton getInstance() {
		if (instance == null) {
			instance = new SelectionModelSingleton();
		}
		return instance;
	}

	/**
	 * return the list of selectable models
	 * @return
	 */
	public List<SelectionEntry> getSelectionModels() {
		return selectionEntries;
	}

	public void setSelectionModels(List<SelectionEntry> selectionModels) {
		this.selectionEntries = selectionModels;
	}

	public SelectionEntry getSelectionEntryById(String modelId) {
		for (SelectionEntry entry : selectionEntries) {
			if (entry.getId().equals(modelId)) {
				return entry;
			}
		}
		throw new NoSuchElementException("can not find entry with id "
				+ modelId);
	}

	/**
	 * return first selected entry which id corresponds
	 * @param modelId
	 * @return
	 */
	public SelectedEntry getSelectedEntryById(String modelId) {
		for (SelectedEntry entry : selectedEntries) {
			if (entry.getId().equals(modelId)) {
				return entry;
			}
		}
		return null;
	}

	/**
	 * return all selected entries
	 * @return
	 */
	public List<SelectedEntry> getSelectedEntries() {
		return selectedEntries;
	}

	
	/**
	 * return true if more than one unit of this ID selected
	 * 
	 * @return
	 */
	public boolean moreThanOneUnitSelected(String unitId) {
		int nbUnit = 0;
		for (SelectedEntry entry : selectedEntries) {
			if (entry instanceof SelectedUnit && (entry.getId().equals(unitId))) {
				nbUnit++;
			}
		}
		return (nbUnit > 1);
	}
	
	/**
	 * return every unique entry of this unit (difference on size, UA, WA). if return.size() > 1, the user must
	 * be prompted in case of deletion
	 * @param unitId
	 * @return ArrayList<SelectedUnit>
	 */
	public ArrayList<SelectedUnit> unitDeletionChoices(String unitId) {

		ArrayList<SelectedUnit> uniqueUnits = new ArrayList<SelectedUnit>();
		
		for (SelectedEntry entry : selectedEntries) {
			if (entry instanceof SelectedUnit && (entry.getId().equals(unitId))) {
				
				SelectedUnit currentUnit = (SelectedUnit) entry;
				boolean notUnique = true;
				for (SelectedUnit unit : uniqueUnits) {
					if (currentUnit.isEquivalentTo(unit)) {
						notUnique = false;
					}
				}
				if (notUnique) {
					uniqueUnits.add(currentUnit);	
				}
			}
		}		
		System.out.println("unitDeletionChoices : " + uniqueUnits.toString());
		return uniqueUnits;
	}

	/**
	 * return the list of currently selected jack commanders (caster, journey man warcaster or jackMarshall)
	 * @return
	 */
	private List<JackCommander> getSelectedJackCommanders() {
		List<JackCommander> result = new ArrayList<JackCommander>();
		for (SelectedEntry entry : selectedEntries) {
			if (entry instanceof JackCommander) {
				result.add((JackCommander) entry);
			}
		}
		return result;
	}	
	
	/**
	 * return the list of currently selected commanders (caster, warlock)
	 * @return
	 */
	private List<SelectedArmyCommander> getSelectedCommanders() {
		List<SelectedArmyCommander> result = new ArrayList<SelectedArmyCommander>();
		for (SelectedEntry entry : selectedEntries) {
			if (entry instanceof SelectedArmyCommander) {
				result.add((SelectedArmyCommander) entry);
			}
		}
		return result;
	}	
	/**
	 * return every unique entry that has the warjack in attachment (caster, jack marshall). if return.size() > 1, the user must
	 * be prompted in case of deletion
	 * @param unitId
	 * @return ArrayList<SelectedUnit>
	 */
	public List<JackCommander> warjackDeletionChoices(String warjackId) {

		ArrayList<JackCommander> result = new ArrayList<JackCommander>();
		
		for (JackCommander model : getSelectedJackCommanders()) {
			if (model.hasJackInAttachment(warjackId)) {
				result.add(model);
			}
		}
		System.out.println("warjackDeletionChoices : " + result.toString());
		return result;
	}	
	

	public void addIndependantModel(SelectionEntry entry) {
		System.out.println("addIndependantModel" + entry);

		if (entry.getType() == ModelTypeEnum.WARCASTER) {
			SelectedEntry selected = new SelectedWarcaster(entry.getId(),
					entry.getFullLabel());
			selectedEntries.add(selected);
			
			ArmyElement caster = ArmySingleton.getInstance().getArmyElement(entry.getId());
			if (caster.getCompanionId() != null && caster.getCompanionId().length() > 0) {
				ArmyElement companion = ArmySingleton.getInstance().getArmyElement(caster.getCompanionId());
				if (companion.getModelType() == ModelTypeEnum.WARJACK) {
					SelectedWarjack companionJack = new SelectedWarjack(companion.getId(), companion.getFullName());
					((JackCommander) selected).getJacks().add(companionJack);
				}
				if (companion.getModelType() == ModelTypeEnum.WARBEAST) {
					SelectedWarbeast companionBeast = new SelectedWarbeast(companion.getId(), companion.getFullName());
					((BeastCommander) selected).getBeasts().add(companionBeast);
				}
			}
			
			
		} else if (entry.getType() == ModelTypeEnum.WARLOCK) {
			SelectedEntry selected = new SelectedWarlock(entry.getId(),
					entry.getFullLabel());
			selectedEntries.add(selected);
		} else {
//			SelectedEntry selected = new SelectedEntry(entry.getId(),
//					entry.getFullLabel());
//			selectedEntries.add(selected);
		}
		saved = false;
	}
	
	public void addBattleEngine(SelectionEntry entry) {
		Log.d("SelectionModelSingleton", "addBattleEngine" + entry);
		SelectedBattleEngine selected = new SelectedBattleEngine(entry.getId(),
				entry.getFullLabel());
		selectedEntries.add(selected);
		saved = false;
	}

	public void addSolo(SelectionSolo entry) {

		boolean freeModel = false;
		if (entry.getAlteredCost() == 0) {
			freeModel = true;
		}
		SelectedEntry addedEntry = null;

		SelectedEntry selected;
		if (entry.isJackMarshall()) {
			selected = new SelectedSoloMarshal(entry.getId(), entry.getFullLabel());
		} else if (entry.isJourneyManWarcaster()) {
			selected = new SelectedJourneyManWarcaster(entry.getId(), entry.getFullLabel());
		} else if (entry.isLesserWarlock()) {
			selected = new SelectedLesserWarlock(entry.getId(), entry.getFullLabel());
		} else {
			selected = new SelectedSolo(entry.getId(), entry.getFullLabel());
		}
		addedEntry = selected;
		selectedEntries.add(selected);
		
		
		ArmyElement solo = ArmySingleton.getInstance().getArmyElement(entry.getId());
		if (solo.getCompanionId() != null && solo.getCompanionId().length() > 0) {
			ArmyElement companion = ArmySingleton.getInstance().getArmyElement(solo.getCompanionId());
			if (companion.getModelType() == ModelTypeEnum.WARBEAST) {
				SelectedWarbeast companionBeast = new SelectedWarbeast(companion.getId(), companion.getFullName());
				
				((BeastCommander) selected).getBeasts().add(companionBeast);
			}
			
			if (companion.getModelType() == ModelTypeEnum.WARJACK) {
				SelectedWarjack companionJack = new SelectedWarjack(companion.getId(), companion.getFullName());
				
				((JackCommander) selected).getJacks().add(companionJack);
			}
		}
		

		
		if (freeModel) {
			addedEntry.setRealCost(0);
			addedEntry.setFreeModel(true);
			addedEntry.setTiersAltered(true);
		} else {
			addedEntry.setRealCost(entry.getAlteredCost());
		}
		
		saved = false;
	}
	
	public void addDragoon(SelectionSolo solo, boolean withDismountOption) {
		boolean freeModel = false;
		if (solo.getAlteredCost() == 0) {
			freeModel = true;
		}
		SelectedDragoon selected = new SelectedDragoon(solo.getId(), solo.getFullLabel(), withDismountOption);
		selectedEntries.add(selected);
		
		if (freeModel) {
			selected.setRealCost(0);
			selected.setFreeModel(true);
			selected.setTiersAltered(true);
		} else {
			selected.setRealCost(selected.getCost());
		}
		
		saved = false;
	}
	
	public void addUnit(SelectionUnit entry, boolean minSize) {
		
		boolean freeModel = false;
		if (entry.getAlteredCost() == 0) {
			freeModel = true;
		}
		
		SelectedUnit selected = null;
		if (entry.isJackMarshall() ) {
			selected = new SelectedUnitMarshall(entry.getId(),
					entry.getFullLabel(), minSize, false);
		} else if (entry.isJackMarshallViaUA()) {
			selected = new SelectedUnitMarshall(entry.getId(),
					entry.getFullLabel(), minSize, true);
		} else {
			selected = new SelectedUnit(entry.getId(),
					entry.getFullLabel(), minSize);
		}
		selectedEntries.add(selected);
		
		if (freeModel) {
			selected.setRealCost(0);
			selected.setFreeModel(true);
			selected.setTiersAltered(true);
		} else {
			selected.setRealCost(selected.getCost());
		}
		
		saved = false;
	}

	public void removeUnit(SelectedUnit unit) {
		System.out.println("removeUnit" + unit);
		selectedEntries.remove(unit);
		saved = false;
	}
	

	public void removeCaster(SelectedArmyCommander caster) {
		System.out.println("removeCaster" + caster);
		selectedEntries.remove(caster);
		saved = false;
	}
	
	/**
	 * remove first occurence of warjack/beast for selected caster/warlock
	 * @param jack
	 * @param caster
	 */
	public void removeWarjack(String jackId, JackCommander casterOrMarshall) {
		casterOrMarshall.removeJack(jackId);
		saved = false;
	}
	
	/**
	 * directly remove entry from list
	 * @param entry
	 */
	public void removeSelectedEntry(SelectedEntry entry) {
		for (SelectedEntry selected : selectedEntries) {
			if (selected.equals(entry)) {
				selectedEntries.remove(entry);
				break;
			}
		}
		saved = false;
	}
	
	/**
	 * directly remove entry from list
	 * @param entry
	 */
	public void removeSelectedSubEntry(SelectedEntry group, SelectedEntry child) {
		if (group instanceof SelectedArmyCommander) {
			if ( child.equals(((SelectedArmyCommander) group).getAttachment())) {
				((SelectedArmyCommander) group).setAttachment(null);
			} else {
				((SelectedArmyCommander) group).getAttachedModels().remove(child);	
			}
		}
		if (group instanceof SelectedUnit) {
			SelectedUnit unit = (SelectedUnit) group;
			if (unit.getUnitAttachment() != null && unit.getUnitAttachment().equals(child)) {
				unit.setUnitAttachment(null);
			} else if (unit.getRankingOfficer() != null && unit.getRankingOfficer().equals(child)) {
				unit.setRankingOfficer(null);
			} else if (unit instanceof SelectedUnitMarshall){
				SelectedUnitMarshall unitMarshall = (SelectedUnitMarshall) unit;
				if (unitMarshall.getJacks().contains(child)) {
					unitMarshall.getJacks().remove(child);
				}
			} 
			unit.getWeaponAttachments().remove(child);
		}
		if (group instanceof JackCommander) {
			((JackCommander) group).getJacks().remove(child);
		}
		if (group instanceof BeastCommander) {
			((BeastCommander) group).getBeasts().remove(child);
		}
		saved = false;
	}

	
	/**
	 * add entry to the only possible attach (unique caster or unique unit)
	 * 
	 * @param entry
	 */
	public void addAttachedElementByDefault(SelectionEntry entry) {
		
		boolean freeModel = false;
		if (entry.getAlteredCost() == 0) {
			freeModel = true;
		}
		
		SelectedEntry addedEntry = null;
		
		if (entry.getType() == ModelTypeEnum.WARJACK || entry.getType() == ModelTypeEnum.COLOSSAL) {
			// attach to caster
			List<SelectedEntry> candidates = modelsToWhichAttach(entry);
			if (candidates.size() == 1) {
				SelectedWarjack newJack = new SelectedWarjack(entry.getId(), entry.getFullLabel());
				addedEntry = newJack;
				((JackCommander) candidates.get(0)).getJacks().add(newJack);
			}
		}
		if (entry.getType() == ModelTypeEnum.WARBEAST || entry.getType() == ModelTypeEnum.GARGANTUAN) {
			// attach to warlock
			List<SelectedEntry> candidates = modelsToWhichAttach(entry);
			if (candidates.size() == 1) {
				SelectedWarbeast newBeast = new SelectedWarbeast(entry.getId(), entry.getFullLabel());
				addedEntry = newBeast;
				((BeastCommander) candidates.get(0)).getBeasts().add(newBeast);
			}
		}

		if (entry.getType() == ModelTypeEnum.SOLO) {
			// maybe attach to caster
			if ( ((SelectionSolo) entry).isWarcasterAttached() ) {
				for (SelectedEntry possibleCaster : selectedEntries) {
					if (possibleCaster instanceof SelectedArmyCommander) {
						
						SelectedCasterAttachment newSolo = new SelectedCasterAttachment(entry.getId(), entry.getFullLabel());
						addedEntry = newSolo;
						((SelectedArmyCommander) possibleCaster).setAttachment(newSolo);
					}
				}
			} else if (((SelectionSolo) entry).isMercenaryUnitAttached() ) {
				List<SelectedEntry> candidates = modelsToWhichAttach(entry);
				SelectedRankingOfficer rankingOfficer = new SelectedRankingOfficer(entry.getId(), entry.getFullLabel());
				addedEntry = rankingOfficer;
				((SelectedUnit) candidates.get(0)).setRankingOfficer(rankingOfficer);
			} else {
				throw new UnsupportedOperationException("addAttachedElementByDefault - can not attach " + entry.getFullLabel() + " - model is not attachable");
			}
			
		}

		if (entry.getType() == ModelTypeEnum.UNIT_ATTACHMENT) {
			// attach to unit
			for (SelectedEntry possibleUnit : selectedEntries) {
				if (possibleUnit instanceof SelectedUnit) {
					if (((SelectedUnit) possibleUnit).getId().equals(
							((SelectionUA) entry).getParentUnitId()) && 
							((SelectedUnit) possibleUnit).getUnitAttachment() == null) {
						SelectedUA ua = new SelectedUA(entry.getId(), entry.getFullLabel());
						addedEntry = ua;
						((SelectedUnit) possibleUnit).setUnitAttachment(ua);
					}
				}
			}
		}
		
		if (entry.getType() == ModelTypeEnum.WEAPON_ATTACHMENT) {
			// attach to unit
			for (SelectedEntry possibleUnit : selectedEntries) {
				if (possibleUnit instanceof SelectedUnit) {
					
					SelectionUnit unit = (SelectionUnit) getSelectionEntryById(possibleUnit.getId());
					if (((SelectedUnit) possibleUnit).getId().equals(
							((SelectionWA) entry).getParentUnitId())) {
						if (((SelectedUnit) possibleUnit).getWeaponAttachments().size() < unit.getMaxWACount()) {
							// can add WA only if unit is not full
							SelectedWA wa = new SelectedWA(entry.getId(), entry.getFullLabel());
							addedEntry = wa;
							((SelectedUnit) possibleUnit).getWeaponAttachments().add(wa);
							
						}
					}
				}
			}
		}
		
		if (freeModel) {
			addedEntry.setRealCost(0);
			addedEntry.setFreeModel(true);
			addedEntry.setTiersAltered(true);
		} else {
			addedEntry.setRealCost(entry.getAlteredCost());
		}

		saved = false;

	}

	public void addAttachedElementTo(SelectionEntry entry,
			SelectedEntry parent) {
	
		boolean freeModel = false;
		if (entry.getAlteredCost() == 0) {
			freeModel = true;
		}
		
		SelectedEntry addedEntry = null;
		
		if (entry.getType() == ModelTypeEnum.WARJACK || entry.getType() == ModelTypeEnum.COLOSSAL) {
			// attach to jack commander
			SelectedWarjack newJack = new SelectedWarjack(entry.getId(),
					entry.getFullLabel());
			addedEntry = newJack;
			((JackCommander) parent).getJacks().add(newJack);
		}
		if (entry.getType() == ModelTypeEnum.WARBEAST || entry.getType() == ModelTypeEnum.GARGANTUAN) {
			// attach to warlock
			SelectedWarbeast newBeast = new SelectedWarbeast(entry.getId(), entry.getFullLabel());
			addedEntry = newBeast;
			((BeastCommander) parent).getBeasts().add(newBeast);
		}

		if (entry.getType() == ModelTypeEnum.SOLO) {
			// maybe attach to caster
			if ( ((SelectionSolo) entry).isWarcasterAttached() ) {
				SelectedCasterAttachment newSolo = new SelectedCasterAttachment(entry.getId(), entry.getFullLabel());
				addedEntry = newSolo;
				((SelectedArmyCommander) parent).setAttachment(newSolo);
			} else if ( ((SelectionSolo) entry).isMercenaryUnitAttached() ) {
				SelectedRankingOfficer rankingOfficer = new SelectedRankingOfficer(entry.getId(), entry.getFullLabel());
				addedEntry = rankingOfficer;
				((SelectedUnit) parent).setRankingOfficer(rankingOfficer);
			} else {
				throw new UnsupportedOperationException("addAttachedElementByDefault - can not attach " + entry.getFullLabel() + " - model is not attachable");
			}
		}

		if (entry.getType() == ModelTypeEnum.UNIT_ATTACHMENT) {
			// attach to unit
			SelectedUA ua = new SelectedUA(entry.getId(), entry.getFullLabel());
			addedEntry = ua;
			((SelectedUnit) parent).setUnitAttachment(ua);
		}
		
		if (entry.getType() == ModelTypeEnum.WEAPON_ATTACHMENT) {
			// attach to unit
			SelectedWA wa = new SelectedWA(entry.getId(), entry.getFullLabel());
			addedEntry = wa;
			((SelectedUnit) parent).getWeaponAttachments().add(wa);
		}
		
		if (freeModel) {
			addedEntry.setRealCost(0);
			addedEntry.setFreeModel(true);
			addedEntry.setTiersAltered(true);
		} else {
			addedEntry.setRealCost(entry.getAlteredCost());
		}
		
		saved = false;

	}

	public String getSelectedList() {
		StringBuffer sb = new StringBuffer();
		for (SelectedEntry entry : selectedEntries) {
			sb.append("[entry id = ").append(entry.getId());
			sb.append("/ models = [");
			sb.append("]]\n");
		}
		return sb.toString();
	}

	/**
	 * return the list of currently selected models to which the selection can
	 * be attached
	 * 
	 * @param selection
	 * @return List<SelectedEntry>
	 */
	public List<SelectedEntry> modelsToWhichAttach(SelectionEntry selection) {
		List<SelectedEntry> result = new ArrayList<SelectedEntry>();
		if (selection.getType() == ModelTypeEnum.WARJACK || selection.getType() == ModelTypeEnum.COLOSSAL) {
			
			Warjack jack = (Warjack) ArmySingleton.getInstance().getArmyElement(selection.getId());

			// check caster restrictions
			List<SelectedEntry> candidates = null;
			if ( jack.getAllowedCastersToWorkFor().isEmpty()) {
				candidates = selectedEntries;
			} else {
				candidates = new ArrayList<SelectedEntry>();
				List<SelectedEntry> allEntries = getSelectedEntriesIncludingChildren(); // must include UA...
				for (SelectedEntry entry : allEntries) {
					if ( jack.getAllowedCastersToWorkFor().contains(entry.getId())) {
						candidates.add(entry);	
					}
				}
			}
			
			boolean shouldAttachToFactionOnly = ! selection.isMercenaryOrMinion();
			// if this is a faction warjack, cannot attach to a merc caster or marshal.
			// merc models don't have problem, cause of "restricted_to" directive.
			
			// attach to caster or marshall
			for (SelectedEntry entry : candidates) {
				
				if (entry instanceof SelectedUA) {
					// replace UA by parent unit
					SelectionUA ua = (SelectionUA) getSelectionEntryById(entry.getId());
					List<SelectedEntry> units = getSelectedEntriesByIdIncludingChildren(ua.getParentUnitId());
					for (SelectedEntry unit : units) {
						if (((SelectedUnit) unit).getUnitAttachment() != null) {
							entry = (SelectedEntry) unit;
						}
					}
				}
				
				if (entry instanceof JackCommander) {
					
					JackCommander candidate = null;
					
					if (shouldAttachToFactionOnly) {
						// must check
						SelectionEntry maybeMerc = getSelectionEntryById(entry.getId());
						if ( ! maybeMerc.isMercenaryOrMinion()) {
							// ok
							candidate = (JackCommander) entry;
						}
					} else {
						// merc jack, follow restrictions from "restricted_to", see above
						candidate = (JackCommander) entry;
					}
					
					if (candidate != null) {
						
						if (candidate instanceof JackMarshall && selection.getType() != ModelTypeEnum.COLOSSAL) {
							// sorry, no colossal for marshall!
							JackMarshall marshall = (JackMarshall) candidate;
							
							boolean isReallyMarshal = true;
							if (candidate instanceof SelectedUnitMarshall) {
								SelectedUnitMarshall unit = (SelectedUnitMarshall) candidate;
								if (unit.isMarshallViaUA()) {
									if (unit.getUnitAttachment() == null) {
										isReallyMarshal = false; // sorry, no UA grants marshall...
									}
								} 
							}
							
							if ( marshall.getMaxJacks() > marshall.getJacks().size() && isReallyMarshal) { 
								if (! selection.isUniqueCharacter()) { // no unique warjacks for marshalls...
									result.add(entry);	
								}
							}
						} else { // no limit for caster or journeyman
							result.add(entry);	
						}

					}
						
				}
			}
		} else if (selection.getType() == ModelTypeEnum.WARBEAST|| selection.getType() == ModelTypeEnum.GARGANTUAN) {
			
			Warbeast beast = (Warbeast) ArmySingleton.getInstance().getArmyElement(selection.getId());

			// check caster restrictions
			List<SelectedEntry> candidates = null;
			if ( beast.getAllowedCastersToWorkFor().isEmpty()) {
				candidates = selectedEntries;
			} else {
				candidates = new ArrayList<SelectedEntry>();
				List<SelectedEntry> allEntries = getSelectedEntriesIncludingChildren(); // must include UA...
				for (SelectedEntry entry : allEntries) {
					if ( beast.getAllowedCastersToWorkFor().contains(entry.getId())) {
						candidates.add(entry);	
					}
				}
			}
			
			boolean shouldAttachToFactionOnly = ! selection.isMercenaryOrMinion();
			// if this is a faction warbeast, cannot attach to a merc warlock or lesser warlock.
			// merc/minions models don't have problem, cause of "restricted_to" directive.
			
			// attach to caster or marshall
			for (SelectedEntry entry : candidates) {
				if (entry instanceof BeastCommander) {
					
					BeastCommander candidate = null;
					if (shouldAttachToFactionOnly) {
						// must check
						SelectionEntry maybeMerc = getSelectionEntryById(entry.getId());
						if ( ! maybeMerc.isMercenaryOrMinion()) {
							// ok
							candidate = (BeastCommander) entry;
						}
					} else {
						// merc jack, follow restrictions from "restricted_to", see above
						candidate = (BeastCommander) entry;
					}
					
					if (candidate != null) {
						if (candidate instanceof SelectedLesserWarlock && selection.getType() != ModelTypeEnum.GARGANTUAN) {
							// sorry, no colossal for marshall!
							SelectedLesserWarlock lesserWarlock = (SelectedLesserWarlock) candidate;
							result.add(lesserWarlock);
						} else { // no limit for caster or journeyman
							result.add(entry);	
						}
					}
				}
			}
		} else if (selection.getType() == ModelTypeEnum.SOLO) {
			// attach to caster only if caster has no attachment already
			if ( ((SelectionSolo) selection).isWarcasterAttached() ) {
				for (SelectedEntry entry : selectedEntries) {
					if (entry instanceof SelectedArmyCommander) {
						if ( ((SelectedArmyCommander) entry).getAttachment() == null) {
							result.add(entry);	
						}
					}
				}
			} else if (((SelectionSolo) selection).isMercenaryUnitAttached()) {
				// attach only to mercenary/minion unit
				for (SelectedEntry entry : selectedEntries) {
					if (entry instanceof SelectedUnit ) {
						if ( getSelectionEntryById(entry.getId()).isMercenaryOrMinion()) {
							if (((SelectedUnit) entry).getRankingOfficer() == null) {
								// may attach only if unit has no attachment
								result.add(entry);
							}
						}
					}
				}
			} else {
				throw new UnsupportedOperationException("modelsToWhichAttach - can not attach " + selection.getFullLabel() + " - model is not attachable");
			}
		} else if (selection.getType() == ModelTypeEnum.UNIT_ATTACHMENT) {
			// attach to unit
			for (SelectedEntry entry : selectedEntries) {
				SelectionUA ua = (SelectionUA) selection;
				if (entry instanceof SelectedUnit) {
					if (entry.getId().equals(ua.getParentUnitId())) {
						if (((SelectedUnit) entry).getUnitAttachment() == null) {
							// may attach only if unit has no attachment
							result.add(entry);
						}
					}
				}
			}
		} else if (selection.getType() == ModelTypeEnum.WEAPON_ATTACHMENT) {
			// attach to unit
			for (SelectedEntry entry : selectedEntries) {
				SelectionWA ua = (SelectionWA) selection;
				if (entry instanceof SelectedUnit) {
					if (entry.getId().equals(ua.getParentUnitId())) {
						SelectionUnit unit = (SelectionUnit) getSelectionEntryById(entry.getId());
						SelectedUnit selected = (SelectedUnit) entry;
						// can add WA only if unit is not full
						if (selected.getWeaponAttachments().size() < unit.getMaxWACount()) {
							result.add(entry);	
						}
					}
				}
			}
		} else {
			throw new NoSuchElementException(selection + " can not be attached");
		}
		return result;
	}

	public String getSelectedCompendium() {
		StringBuffer sb = new StringBuffer();

		int nbModels = 0;
		int cost = 0;
		int nbCasters = 0;
		for (SelectedEntry entry : selectedEntries) {
			nbModels += entry.getModelCount();
			
			cost += entry.getTotalCost();
			
			if (entry instanceof SelectedArmyCommander) {
				nbCasters++;
				
				SelectedArmyCommander commander = (SelectedArmyCommander) entry;
				SelectionEntry selection = getSelectionEntryById(entry.getId());
				int commanderCost = selection.getBaseCost();
				
				int jackOrBeastCost = 0;
				for (SelectedModel jackOrBeast : commander.getAttachedModels()) {
					if (jackOrBeast instanceof SelectedWarjack || jackOrBeast instanceof SelectedWarbeast) {
						jackOrBeastCost += getSelectionEntryById(jackOrBeast.getId()).getAlteredCost();
					}
				}
				int costToRemove = Math.min(jackOrBeastCost, commanderCost);
				cost -= costToRemove;
			}
		}
		sb.append(nbCasters).append("/").append(this.nbCasters)
				.append("caster");
		sb.append(" - ");
		if (cost > nbPoints) {
			sb.append("<font color=\"red\">");
			sb.append(cost);
			sb.append("</font>");
		} else {
			sb.append("<font color=\"green\">");
			sb.append(cost);
			sb.append("</font>");
		}
		sb.append("/").append(nbPoints).append(" PC");
		sb.append(" - ").append(nbModels).append(" models");

		return sb.toString();

	}

	public int getNbCasters() {
		return nbCasters;
	}

	public void setNbCasters(int nbCasters) {
		this.nbCasters = nbCasters;
		saved = false;
	}

	public int getNbPoints() {
		return nbPoints;
	}

	public void setNbPoints(int nbPoints) {
		this.nbPoints = nbPoints;
		saved = false;
	}

	/**
	 * clean all selection data : reset selected list, recompose selection list
	 * from basic data.
	 */
	public void cleanAll() {
		selectedEntries.clear();
		selectionEntries.clear();
		currentTiers = null;
		currentTiersLevel = 0;
		currentContract = null;
		currentlyViewedElement = null;

		Faction factionData = ArmySingleton.getInstance().getFactions()
				.get(faction.getId());
		
		selectionEntries.addAll(factionData.getAvailableModels());
		armyFileName = UNTITLED_FILE_NAME;
		saved = false;
	}

	/**
	 * recreate selection entries
	 */
	public void rebuildSelectionEntries() {
		selectionEntries.clear();
		Faction factionData = ArmySingleton.getInstance().getFactions()
				.get(faction.getId());
		selectionEntries.addAll(factionData.getAvailableModels());	
	}
	
	
	/**
	 * alter selection list objects to reflect current selected state
	 */
	public void recomposeSelectionList() {

		// reset all
		for (SelectionEntry entry : selectionEntries) {
			entry.setCountSelected(0);
			entry.setCostSelected(0);
			entry.setSelected(false);
			entry.setSelectable(false);
		}

		for (SelectedEntry entry : selectedEntries) {

			if (entry instanceof SelectedArmyCommander) {

				SelectedArmyCommander caster = (SelectedArmyCommander) entry;
				SelectionEntry selectionCaster = getSelectionEntryById(caster
						.getId());
				selectionCaster.addOne();
				selectionCaster.setSelected(true);
				selectionCaster.setSelectable(false);

				for (SelectedModel attachs : caster.getAttachedModels()) {
					SelectionEntry selectionCasterAttachment = getSelectionEntryById(attachs
							.getId());
					selectionCasterAttachment.addOne();
				}
				if (caster.getAttachment() != null) {
					SelectionEntry selectionCasterAttachment = getSelectionEntryById(caster.getAttachment().getId());
					selectionCasterAttachment.addOne();
				}
			}

			if (entry instanceof SelectedUnit) {
				SelectedUnit unit = (SelectedUnit) entry;
				SelectionUnit selectionUnit = (SelectionUnit) getSelectionEntryById(unit
						.getId());

				if (unit.isMinSize()) {
					selectionUnit.addOneMinUnit();
				} else {
					selectionUnit.addOneMaxUnit();
				}
				
				if (unit.getRankingOfficer() != null) {
					SelectionEntry ra = getSelectionEntryById(unit.getRankingOfficer().getId());
					ra.addOne();
				}
				
				if (unit.getUnitAttachment() != null) {
					SelectionEntry ua = getSelectionEntryById(unit.getUnitAttachment().getId());
					ua.addOne();
				}

				if (unit.getWeaponAttachments().size() > 0 ) {
					SelectionWA wa = (SelectionWA) getSelectionEntryById(unit.getWeaponAttachments().get(0).getId());
					wa.addOne(unit.getWeaponAttachments().size());	
				}

				if (entry instanceof SelectedUnitMarshall) {
					List<SelectedWarjack> jacks = ((SelectedUnitMarshall) entry).getJacks();
					for (SelectedWarjack jack : jacks) {
						SelectionEntry selectionJack = getSelectionEntryById(jack.getId());
						selectionJack.addOne();
					}
				}
			}
			
			if (entry instanceof SelectedSolo) {
				SelectedSolo solo = (SelectedSolo) entry;
				SelectionSolo selectionSolo = (SelectionSolo) getSelectionEntryById(solo.getId());
				selectionSolo.addOne();
				
				if (entry instanceof SelectedSoloMarshal || entry instanceof SelectedJourneyManWarcaster) {
					List<SelectedWarjack> jacks = ((JackCommander) entry).getJacks();
					for (SelectedWarjack jack : jacks) {
						SelectionEntry selectionJack = getSelectionEntryById(jack.getId());
						selectionJack.addOne();
					}
				}
				
				if (entry instanceof SelectedLesserWarlock) {
					List<SelectedWarbeast> beasts = ((SelectedLesserWarlock) entry).getBeasts();
					for (SelectedWarbeast beast : beasts) {
						SelectionEntry selectionBeast = getSelectionEntryById(beast.getId());
						selectionBeast.addOne();
					}
				}
			}
			
			if (entry instanceof SelectedBattleEngine) {
				SelectedBattleEngine be = (SelectedBattleEngine) entry;
				SelectionEntry selectionBE = (SelectionEntry) getSelectionEntryById(be.getId());
				selectionBE.addOne();
			}

		}
	}

	/**
	 * calculate which level of tier is attained
	 * @return
	 */
	public int computeTiersLevel() {
		
		int previousLevel = currentTiersLevel;
		
		int levelAtteined = 0;
		if (currentTiers == null) {
			currentTiersLevel = 0;
			return levelAtteined;
		}
		for (TierLevel level : currentTiers.getLevels()) {
			Log.d("computeTiersLevel", "checking for level " + level.getLevel());
			if (levelAtteined < level.getLevel() - 1) {
				// previous level not reached, no use to pursue...
				break;
			}
			
			boolean levelOK = true;

			// check only models
			HashMap<String, TierEntry> map = level.getOnlyModelsById(); 
			for (SelectionEntry model : selectionEntries) {
				if (model.isSelected()) {
					if ( ! map.containsKey(model.getId()) ) {
						Log.d("computeTiersLevel", "model " + model.getId() + " not authorized in tiers level " + level.getLevel());
						levelOK = false;
						break;
					}
				}
			}

			// check compulsory models
			ArrayList<TierEntryGroup> mustHaveModels = level.getMustHaveModels();
			for (TierEntryGroup compulsoryGroup : mustHaveModels) {
				int minCount = compulsoryGroup.getMinCount();
				int selectedCount = 0;
				for (TierEntry compulsoryEntry : compulsoryGroup.getEntries()) {
					for (SelectionEntry model : selectionEntries) {
						if (model.isSelected()) {
							if (model.getId().equals(compulsoryEntry.getId())) {
								selectedCount += model.getCountSelected();
								Log.d("computeTiersLevel", "found " + model.getCountSelected() + " of " + model.getId()); 
							}
						}
					}
				}
				if (selectedCount < minCount) {
					Log.d("computeTiersLevel", "not enough of ("+ compulsoryGroup.toString() + ") in tiers level " + level.getLevel());
					levelOK = false;
				} else {
					Log.d("computeTiersLevel", "found enough of ("+ compulsoryGroup.toString() + ") in tiers level " + level.getLevel());
				}
			}
			
			for (TierEntryGroup compulsoryGroup : level.getMustHaveModelsInBG()) {
				int minCount = compulsoryGroup.getMinCount();
				int selectedCount = 0;
				for (TierEntry compulsoryEntry : compulsoryGroup.getEntries()) {
					for (SelectedArmyCommander armyCommander : getSelectedCommanders() ) {
						if (armyCommander.hasModelInAttachment(compulsoryEntry.getId())) {
							selectedCount += 1;
						}
					}
				}
				if (selectedCount < minCount) {
					Log.d("computeTiersLevel", "not enough of ("+ compulsoryGroup.toString() + ") in tiers level " + level.getLevel());
					levelOK = false;
				} else {
					Log.d("computeTiersLevel", "found enough of ("+ compulsoryGroup.toString() + ") in tiers level " + level.getLevel());
				}
			}
			
			if (levelOK) {
				Log.d("computeTiersLevel", "checking for level " + level.getLevel() + " : OK");
				levelAtteined = level.getLevel();
			} else {
				Log.d("computeTiersLevel", "checking for level " + level.getLevel() + " : failed");
			}
		}
		
		currentTiersLevel = levelAtteined;
		
		if (previousLevel != levelAtteined) {
			tierLevelJustChanged = true;
		}
		
		return levelAtteined;
		
	}
	
	public boolean isTierLevelJustChanged() {
		return tierLevelJustChanged;
	}
	
	public void acknowledgeTierLevelChange() {
		tierLevelJustChanged = false;
	}
	
	private void alterFA() {
		
		// reset FA
		if (currentTiers == null && currentContract == null) {
			for (SelectionEntry entry : selectionEntries) {
				entry.setAlteredFA(entry.getBaseFA());
			}
		} else {
			// all FA to 0, except those accepted in tiers/contracts, which will be setted after
			for (SelectionEntry entry : selectionEntries) {
				entry.setAlteredFA(0);
			}
		}
		
		if (currentTiers != null) {
			// allow only allowed models with their base FA
			for (TierLevel level : currentTiers.getLevels()) {
				for (TierEntry allowedModel : level.getOnlyModels()) {
					SelectionEntry alteredEntry = getSelectionEntryById(allowedModel.getId());
					alteredEntry.setAlteredFA( alteredEntry.getBaseFA());
				}
			}
			
			
			// apply alterations
			for (TierLevel level : currentTiers.getLevels()) {
				if (level.getLevel() <= currentTiersLevel) {
					TierBenefit benefit = level.getBenefit();
					
					for (TierFACostBenefit alteration : benefit.getAlterations()) {
						if (alteration instanceof TierFAAlteration) {
							TierFAAlteration faAlter = (TierFAAlteration) alteration;
							
							SelectionEntry alteredEntry = getSelectionEntryById(faAlter.getEntry().getId());
							
							if (faAlter.getFaAlteration() == ArmyElement.MAX_FA) {
								// sets FA to U
								alteredEntry.setAlteredFA(ArmyElement.MAX_FA);
							} else {
								alteredEntry.setAlteredFA( alteredEntry.getBaseFA() + faAlter.getFaAlteration());	
							}
						}
					}
				}
			}
		}
		
		if (currentContract != null) {
			for (TierEntry allowedModel : currentContract.getOnlyModels()) {
				SelectionEntry alteredEntry = getSelectionEntryById(allowedModel.getId());
				alteredEntry.setAlteredFA( alteredEntry.getBaseFA());
			}
			
			TierBenefit benefit = currentContract.getBenefit();
			if (benefit != null) {
				for (TierFACostBenefit alteration : benefit.getAlterations()) {
					if (alteration instanceof TierFAAlteration) {
						TierFAAlteration faAlter = (TierFAAlteration) alteration;
						
						SelectionEntry alteredEntry = getSelectionEntryById(faAlter.getEntry().getId());
						alteredEntry.setAlteredFA( alteredEntry.getBaseFA() + faAlter.getFaAlteration());
					}
				}
			}
		}
	}
	
	private void alterCost() {
		// reset Cost
		for (SelectionEntry entry : selectionEntries) {
			entry.setAlteredCost(entry.getBaseCost());
		}
		
		if (currentTiers == null && currentContract == null) {
			return;
		}
		// apply alterations
		if (currentTiers != null) {
			for (TierLevel level : currentTiers.getLevels()) {
				if (level.getLevel() <= currentTiersLevel) {
					treatBenefit(level.getBenefit());
				}
			}
		}
		if (currentContract != null && currentContract.getBenefit() != null) {
			treatBenefit(currentContract.getBenefit());
		}
	}

	private void treatBenefit(TierBenefit benefit) {
		
		for (TierFACostBenefit alteration : benefit.getAlterations()) {
			if (alteration instanceof TierCostAlteration) {
				TierCostAlteration costAlter = (TierCostAlteration) alteration;
				
				SelectionEntry alteredEntry = getSelectionEntryById(costAlter.getEntry().getId());
				alteredEntry.setAlteredCost( alteredEntry.getBaseCost() - costAlter.getCostAlteration());
				
				// apply retroactively cost alteration to models already selected
				List<SelectedEntry> existingEntries = getSelectedEntriesByIdIncludingChildren(costAlter.getEntry().getId());
				for (SelectedEntry selected : existingEntries) {
					if (! selected.isTiersAltered()) {
						selected.setRealCost(alteredEntry.getAlteredCost());
						selected.setTiersAltered(true);
					}
				}
			}
		}
		
		for (TierFreeModel freebie : benefit.getFreebies()) {
			
			boolean bonusAlreadyUsed = false;
			
			for (TierEntry freeModel : freebie.getFreeModels()) {
				
				// check if entry already selected
				List<SelectedEntry> possibleChoices = getSelectedEntriesByIdIncludingChildren(freeModel.getId());
				
				for (SelectedEntry selectedEntry : possibleChoices) {
					if (selectedEntry.getId().equals(freeModel.getId()) && selectedEntry.isTiersAltered() 
						&& selectedEntry.getRealCost() == 0 ) {
						// this entry already added at 0 cost
						bonusAlreadyUsed = true;
					}
				}
			}
			
			if (!bonusAlreadyUsed) {
				for (TierEntry freeModel : freebie.getFreeModels()) {
					SelectionEntry alteredEntry = getSelectionEntryById(freeModel.getId());
					alteredEntry.setAlteredCost(0);
					// add 1 to FA to make sure the entry can be selected
					if (alteredEntry.getBaseFA() != ArmyElement.MAX_FA && ! alteredEntry.isUniqueCharacter()) {
						alteredEntry.setAlteredFA( alteredEntry.getBaseFA() + 1);	
					}
				}
			} else {
				// restore normal cost, but maintain FA bonus (to allow normal addition)
				for (TierEntry freeModel : freebie.getFreeModels()) {
					SelectionEntry alteredEntry = getSelectionEntryById(freeModel.getId());
					alteredEntry.setAlteredCost(alteredEntry.getBaseCost());
					// add 1 to FA to make sure the entry can be selected
					alteredEntry.setAlteredFA( alteredEntry.getBaseFA() + 1);
				}
			}
		}
	}
	
	/**
	 * return every entry, searching in attached jacks, ua, wa, ... 
	 * @param id
	 * @return
	 */
	private List<SelectedEntry> getSelectedEntriesIncludingChildren() {
		ArrayList<SelectedEntry> result = new ArrayList<SelectedEntry>();
		
		for (SelectedEntry entry : selectedEntries) {
			result.add(entry); 
			
			if (entry instanceof SelectedArmyCommander) {
				SelectedModel attachment = ((SelectedArmyCommander) entry).getAttachment();
				if (attachment != null ) {
					result.add(attachment);
				}
			}
			if (entry instanceof SelectedUnit) {
				for ( SelectedEntry child : ((SelectedUnit) entry).getChilds()) {
					result.add(child);
				} 
			}
			if (entry instanceof JackCommander ) {
				for ( SelectedEntry child : ((JackCommander) entry).getJacks()) {
					result.add(child);
				} 
			}
			
			if (entry instanceof BeastCommander ) {
				for ( SelectedEntry child : ((BeastCommander) entry).getBeasts()) {
					result.add(child);
				} 
			}
		}
		return result;		
	}
	
	/**
	 * return every entry with given id, searching in attached jacks, ua, wa, ... 
	 * @param id
	 * @return
	 */
	private List<SelectedEntry> getSelectedEntriesByIdIncludingChildren(String id) {
		
		ArrayList<SelectedEntry> result = new ArrayList<SelectedEntry>();
		
		for (SelectedEntry entry : selectedEntries) {
			
			if (entry.getId().equals(id)) {
				result.add(entry); 
			}
			
			if (entry instanceof SelectedArmyCommander) {
				SelectedModel attachment = ((SelectedArmyCommander) entry).getAttachment();
				if (attachment != null && attachment.getId().equals(id)) {
					result.add(attachment);
				}
			}
			if (entry instanceof SelectedUnit) {
				for ( SelectedEntry child : ((SelectedUnit) entry).getChilds()) {
					if (child.getId().equals(id)) {
						result.add(child);
					}
				} 
			}
			if (entry instanceof JackCommander ) {
				for ( SelectedEntry child : ((JackCommander) entry).getJacks()) {
					if (child.getId().equals(id)) {
						result.add(child);
					}
				} 
			}
			
			if (entry instanceof BeastCommander ) {
				for ( SelectedEntry child : ((BeastCommander) entry).getBeasts()) {
					if (child.getId().equals(id)) {
						result.add(child);
					}
				} 
			}
		}
		return result;
		
	}
	
	
	public void checkAndAlterSelectionList() {
		
		computeTiersLevel();

		alterFA();
		alterCost();


		int warcasterCount = 0;
		int mercWarcasterCount = 0;

		ArrayList<String> commandersIds = new ArrayList<String>();
		
		// first of all, count selected casters
		for (SelectionEntry model : selectionEntries) {
			if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK) {
				if (model.isSelected()) {
					if (model.isMercenaryOrMinion()) {
						mercWarcasterCount++;
					} else {
						warcasterCount++;	
					}
					commandersIds.add(model.getId());
				}
			}
		}
		
		

		if (warcasterCount + mercWarcasterCount >= nbCasters) {
			// caster slot full.
			for (SelectionEntry model : selectionEntries) {
				if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK) {
					Log.d("computeSelection", "warcaster made not selectable cause warcaster count full"
							+ model);
					model.setSelectable(false);
					if (!model.isSelected()) {
						model.setVisible(false);
					} else {
						model.setVisible(true);
					}
				}
			}
		}
		
		if (warcasterCount + mercWarcasterCount < nbCasters) {
			Log.d("computeSelection", "warcaster slot not full, all casters selectable (except already selected & epic version of selected)");
			// can select only casters at startup
			for (SelectionEntry model : selectionEntries) {
				if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK && ! model.isMercenaryOrMinion()) {
					if (!model.isSelected()) {
						model.setSelectable(true);
					}
					model.setVisible(true);
				} 
			}
		}



		if (warcasterCount + mercWarcasterCount > 0) {
			
			int nbCasters = warcasterCount + mercWarcasterCount;
			// compute FA for all others entries
			for (SelectionEntry model : selectionEntries) {
				if (model.getType() == ModelTypeEnum.WARCASTER
						|| model.getType() == ModelTypeEnum.WARLOCK) {
					// rien
				}

				if (model.getType() == ModelTypeEnum.WEAPON_ATTACHMENT || model.getType() == ModelTypeEnum.UNIT_ATTACHMENT ) {
					// UA, WA can be selected only if parent unit selected.
					@SuppressWarnings("unchecked")
					List<SelectedUnit> units = (List<SelectedUnit>) (List<?>) modelsToWhichAttach(model);
					
					if (model.getType() == ModelTypeEnum.WEAPON_ATTACHMENT && model.getAlteredFA() > 0) {
						// even if FA attained, may attach if count of WA < max_WA
						if (units.size() > 0) {
							model.setSelectable(true);	
						} else {
							model.setSelectable(false);
						}
					} else {
						if (units.size() > 0 && model.getCountSelected() < model.getAlteredFA() * nbCasters) {
							model.setSelectable(true);	
						} else {
							model.setSelectable(false);
						}
					}
					
				}

				if (model.getType() != ModelTypeEnum.WARCASTER
						&& model.getType() != ModelTypeEnum.WARLOCK 
						&& model.getType() != ModelTypeEnum.WEAPON_ATTACHMENT
						&& model.getType() != ModelTypeEnum.UNIT_ATTACHMENT) {
					// check FA for each model
					if (model.getCountSelected() < model.getAlteredFA() * nbCasters) {
						Log.d("computeSelection", "model made selectable" + model + " : FA not full ");
						model.setSelectable(true);
					} else {
						Log.d("computeSelection", "model made not selectable"
								+ model + " : FA already at max ");
						model.setSelectable(false);
					}
				}
			}

		}
		
		handleMercs(warcasterCount, mercWarcasterCount);
		
		
		// last of all, treats warcaster generation!
		if (nbCasters > 1) {
			Log.d("computeSelection", "multiple casters - prevents selection of P and E version");
			Log.d("computeSelection", "already selected : " + commandersIds.toString());
			// prevents selecting normal & epic version
			for (String id : commandersIds) {
				ArmyCommander commander = (ArmyCommander) ArmySingleton.getInstance().getArmyElement(id);
				commander.getGenerationId();
				
				if (commander.getGenerationId() != null && commander.getGenerationId().length() > 0)
				for (SelectionEntry model : selectionEntries) {
					if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK) {
						ArmyCommander maybeSameIdCommander = (ArmyCommander) ArmySingleton.getInstance().getArmyElement(model.getId());
						if (commander.getGenerationId().equals(maybeSameIdCommander.getGenerationId())) {
							model.setSelectable(false);
							model.setVisible(false);
						}
					}
				}
			}
		}

	}
	
	/**
	 * handle selectable value for mercs entry
	 * @param warcasterCount
	 * @param mercWarcasterCount
	 */
	private void handleMercs(int warcasterCount, int mercWarcasterCount) {
		
		boolean allowNewMercCasters = false;
		
		if (mercWarcasterCount < nbCasters - warcasterCount && warcasterCount > 0) {
			allowNewMercCasters = true;
		}
		
		if (faction == FactionNamesEnum.MERCENARIES || faction == FactionNamesEnum.MINIONS) {
			if (mercWarcasterCount < nbCasters) {
				allowNewMercCasters = true;	
			}
		}
		
		List<SelectionEntry> mercSelectedCasters = new ArrayList<SelectionEntry>();
		
		for (SelectionEntry model : selectionEntries) {
			if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK) {
				if ( model.isMercenaryOrMinion() && !model.isSelected() && allowNewMercCasters) {
					// not selected --> selectable & visible
					model.setVisible(true);
					model.setSelectable(true);
				} else if (model.isMercenaryOrMinion() && model.isSelected()) {
					// selected --> visible
					model.setVisible(true);
					model.setSelectable(false);
					mercSelectedCasters.add(model);
				} else if (model.isMercenaryOrMinion()){
					// not selectable --> hidden
					model.setVisible(false);
				} else {
					model.setVisible(true); // caster not mercenary, always show
				}
			} 
		}
		
		// hide all mercs jacks not allowed to a merc caster, merc marshall (solo or UA)
		for (SelectionEntry model : selectionEntries) {
			if ((model.getType() == ModelTypeEnum.WARJACK || model.getType() == ModelTypeEnum.COLOSSAL) && model.isMercenaryOrMinion()) {
				Warjack jack = (Warjack) ArmySingleton.getInstance().getArmyElement(model.getId());
				boolean jackAllowed = false;
				List<SelectedEntry> candidates = getSelectedEntriesIncludingChildren();
				for (SelectedEntry wannabeMercCasterOrMarshall : candidates) {
					if (jack.getAllowedCastersToWorkFor().contains(wannabeMercCasterOrMarshall.getId())) {
						jackAllowed = true;
					} 
				}
				
				if (jackAllowed) {
					model.setVisible(true);
					model.setSelectable(true);
				} else {
					model.setVisible(false);	
				}
				// check FA, nevertheless...
				if (model.getAlteredFA() * nbCasters <= model.getCountSelected() ) {
					model.setSelectable(false);
				}
				if (model.isUniqueCharacter() && model.getCountSelected() == 1) {
					model.setSelectable(false);
				}

			}
			if ((model.getType() == ModelTypeEnum.WARBEAST || model.getType() == ModelTypeEnum.GARGANTUAN) && model.isMercenaryOrMinion()) {
				Warbeast beast = (Warbeast) ArmySingleton.getInstance().getArmyElement(model.getId());
				boolean beastAllowed = false;
				List<SelectedEntry> candidates = getSelectedEntriesIncludingChildren();
				for (SelectedEntry wannabeMercCasterOrMarshall : candidates) {
					if (beast.getAllowedCastersToWorkFor().contains(wannabeMercCasterOrMarshall.getId())) {
						beastAllowed = true;
					} 
				}
				
				if (beastAllowed) {
					model.setVisible(true);
					model.setSelectable(true);
				} else {
					model.setVisible(false);	
				}
			
				// check FA, nevertheless...
				if (model.getAlteredFA() * nbCasters <= model.getCountSelected() ) {
					model.setSelectable(false);
				}
				if (model.isUniqueCharacter() && model.getCountSelected() == 1) {
					model.setSelectable(false);
				}

			}
		}

	}
	

	public FactionNamesEnum getFaction() {
		return faction;
	}

	public void setFaction(FactionNamesEnum faction) {
		this.faction = faction;
	}


	public boolean hasValidFileName() {
		if ( ! UNTITLED_FILE_NAME.equals(armyFileName) && armyFileName.length() > 0) {
			return true;
		}
		return false;
	}

	public String getArmyFileName() {
		return armyFileName;
	}

	public ArmyElement getCurrentlyViewedElement() {
		return currentlyViewedElement;
	}

	public void setCurrentlyViewedElement(ArmyElement currentlyViewedElement) {
		this.currentlyViewedElement = currentlyViewedElement;
	}

	public void setArmyFileName(String armyFileName) {
		this.armyFileName = armyFileName;
	}

	public Tier getCurrentTiers() {
		return currentTiers;
	}

	public int getCurrentTiersLevel() {
		return currentTiersLevel;
	}

	public void setCurrentTiers(Tier currentTiers) {
		if (this.currentTiers != currentTiers) {
			saved = false;	
		}
		
		this.currentTiers = currentTiers;
		recomposeSelectionList();
	}

	public Contract getCurrentContract() {
		return currentContract;
	}

	public void setCurrentContract(Contract currentContract) {
		if (this.currentContract != currentContract) {
			saved = false;	
		}
		this.currentContract = currentContract;
	}

	public boolean isSaved() {
		return saved;
	}

	public void setSaved(boolean saved) {
		this.saved = saved;
	}
}
