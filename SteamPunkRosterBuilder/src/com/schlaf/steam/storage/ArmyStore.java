package com.schlaf.steam.storage;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.schlaf.steam.activities.battle.BattleEntry;
import com.schlaf.steam.activities.battle.MultiPVUnit;
import com.schlaf.steam.activities.selectlist.selected.BeastCommander;
import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedUA;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.activities.selectlist.selected.SelectedWA;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarbeast;
import com.schlaf.steam.activities.selectlist.selected.SelectedWarjack;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Solo;
import com.schlaf.steam.data.UnitAttachment;
import com.schlaf.steam.data.Warbeast;
import com.schlaf.steam.data.Warjack;
import com.schlaf.steam.data.WeaponAttachment;

public class ArmyStore implements Serializable {

	private static final long serialVersionUID = -8997444309756364811L;
	protected String filename;
	protected String factionId;
	protected int nbCasters;
	protected int nbPoints;
	protected List<SelectedEntry> entries;
	protected String tierId;
	protected String contractId;
	
	public ArmyStore(String title) {
	}
	
	public ArmyStore(ArmyStore another)  {
		filename = another.getFilename();
		factionId = another.getFactionId();
		nbCasters = another.getNbCasters();
		nbPoints = another.getNbPoints();
		entries = another.getEntries();
		tierId = another.getTierId();
	}

	public String getFactionId() {
		return factionId;
	}

	public void setFactionId(String factionId) {
		this.factionId = factionId;
	}

	public int getNbCasters() {
		return nbCasters;
	}

	public void setNbCasters(int nbCasters) {
		this.nbCasters = nbCasters;
	}

	public int getNbPoints() {
		return nbPoints;
	}

	public void setNbPoints(int nbPoints) {
		this.nbPoints = nbPoints;
	}

	public List<SelectedEntry> getEntries() {
		return entries;
	}

	public void setEntries(List<SelectedEntry> entries) {
		this.entries = entries;
	}

	public String getTierId() {
		return tierId;
	}

	public void setTierId(String tierId) {
		this.tierId = tierId;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getContractId() {
		return contractId;
	}

	public void setContractId(String contractId) {
		this.contractId = contractId;
	}
	
	public List<String> getCommanders() {
		ArrayList<String> commanders = new ArrayList<String>();
		for ( SelectedEntry entry : entries) {
			if (entry instanceof SelectedArmyCommander) {
				commanders.add(entry.getLabel());
			}
		}
		return commanders;
	}
	
	
	public String getHTMLDescription() {
		StringBuffer sb = new StringBuffer(1024);
	
		for (SelectedEntry entry : entries) {
			
			ArmyElement element = ArmySingleton.getInstance().getArmyElement(entry.getId());
			
			sb.append("<br>").append("<B>").append(element.toString()).append("</B>");
			
			
			// attach descendants
			if (entry instanceof JackCommander) {
				for (SelectedWarjack jack : ((JackCommander) entry).getJacks()) {
					Warjack aJack = (Warjack) ArmySingleton.getInstance().getArmyElement(jack.getId());
					sb.append("<br>* ").append(aJack.toString());
				}
			}
			
			if (entry instanceof BeastCommander) {
				for (SelectedWarbeast beast : ((BeastCommander) entry).getBeasts()) {
					Warbeast aBeast = (Warbeast) ArmySingleton.getInstance().getArmyElement(beast.getId());
					sb.append("<br>* ").append(aBeast.toString());
				}
			}
			
			if (entry instanceof SelectedArmyCommander) {
				if ( ((SelectedArmyCommander)entry).getAttachment() != null) {
					Solo attachment = (Solo) ArmySingleton.getInstance().getArmyElement(((SelectedArmyCommander)entry).getAttachment().getId());
					sb.append("<br>* ").append(attachment.toString());
				}
			}
			
			if (entry instanceof SelectedUnit) {
				sb.append("[").append(((SelectedUnit) entry).getModelCount()).append("]");
				if ( ((SelectedUnit) entry).getUnitAttachment() != null) {
					SelectedUA ua = ((SelectedUnit) entry).getUnitAttachment();
					ArmyElement uaDescription = ArmySingleton.getInstance().getArmyElement(ua.getId());
					sb.append("<br>* ").append(uaDescription.toString());
				}
				
				if ( ! ((SelectedUnit) entry).getWeaponAttachments().isEmpty() ) {
					SelectedWA wa = ((SelectedUnit) entry).getWeaponAttachments().get(0);
					int waCount = ((SelectedUnit) entry).getWeaponAttachments().size();
					ArmyElement waDescription = ArmySingleton.getInstance().getArmyElement(wa.getId());
					sb.append("<br>* ").append(waCount).append(" ").append(waDescription.toString());
				}
			}
		
		}
		
		return sb.toString();
	}
	
	
}

