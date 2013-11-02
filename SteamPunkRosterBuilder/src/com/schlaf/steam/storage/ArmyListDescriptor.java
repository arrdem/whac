package com.schlaf.steam.storage;

import java.util.Iterator;
import java.util.List;

import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedSolo;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.data.FactionNamesEnum;

public class ArmyListDescriptor implements Comparable<ArmyListDescriptor>{

	private String fileName;
	private FactionNamesEnum faction;
	private int nbPoints;
	private int nbCasters;
	private List<String> commanders;

	int casterCount = 0;
	int warjackCount = 0;
	int warbeastCount = 0;
	int unitCount = 0;
	int soloCount = 0;
	int beCount = 0;
	int colossalCount = 0;
	int gargantuanCount = 0;
	String commandersString;

	
	public ArmyListDescriptor(ArmyStore store) {
		fileName = store.getFilename();
		faction = FactionNamesEnum.getFaction(store.getFactionId());
		nbPoints = store.getNbPoints();
		nbCasters = store.getNbCasters();
		commanders = store.getCommanders();
		
		
		for (SelectedEntry entry : store.getEntries()) {
			if (entry instanceof SelectedArmyCommander) {
				casterCount++;
			}
			if (entry instanceof SelectedUnit) {
				unitCount++;
			}
			if (entry instanceof SelectedSolo) {
				soloCount ++;
			}
			
			if (entry instanceof JackCommander) {
				warjackCount += ((JackCommander) entry).getJacks().size();
			}
		}
		
		Iterator<String> it = commanders.iterator();
		StringBuffer sb = new StringBuffer();
		if (it.hasNext()) {
			sb.append(it.next());
		}
		while (it.hasNext()) {
			sb.append("-");
			sb.append(it.next());
		}
		commandersString = sb.toString();
				
	}
	
	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append(fileName).append(" (").append(faction).append(")").append(" - ");
		sb.append(" - ").append(nbPoints).append(" points. ");
		Iterator<String> it = commanders.iterator();
		if (it.hasNext()) {
			sb.append(it.next());
		}
		while (it.hasNext()) {
			sb.append("-");
			sb.append(it.next());
		}
		
		return sb.toString();
	}
	
	public String getDescription() {
		StringBuffer sb = new StringBuffer();
		sb.append(nbPoints).append("points [ ");
		sb.append(commandersString).append(" ] ").append(getHtmlModelsCount());
		return sb.toString();
	}

	public String getFileName() {
		return fileName;
	}

	public FactionNamesEnum getFaction() {
		return faction;
	}

	public int getNbPoints() {
		return nbPoints;
	}

	public int getNbCasters() {
		return nbCasters;
	}

	public List<String> getCommanders() {
		return commanders;
	}

	@Override
	public int compareTo(ArmyListDescriptor another) {
		
		int factionCompareResult = faction.compareTo(another.getFaction());
		if ( factionCompareResult != 0) {
			return factionCompareResult;
		}
		
		return fileName.compareTo(another.getFileName());
	}

	public int getCasterCount() {
		return casterCount;
	}

	public int getWarjackCount() {
		return warjackCount;
	}

	public int getWarbeastCount() {
		return warbeastCount;
	}

	public int getUnitCount() {
		return unitCount;
	}

	public int getSoloCount() {
		return soloCount;
	}

	public int getBeCount() {
		return beCount;
	}

	public int getColossalCount() {
		return colossalCount;
	}

	public int getGargantuanCount() {
		return gargantuanCount;
	}

	public String  getHtmlModelsCount() {
		StringBuffer sb = new StringBuffer(100);
		
		sb.append("WC:").append(casterCount);
		if (warjackCount> 0){
			sb.append(" WJ:").append(warjackCount);
		}
		if (warbeastCount> 0){
			sb.append(" WB:").append(warbeastCount);
		}
		sb.append(" U:").append(unitCount).append(" S:").append(soloCount);
		return sb.toString();
	}
	
}
