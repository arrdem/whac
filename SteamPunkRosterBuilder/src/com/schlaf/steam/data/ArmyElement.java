/**
 * 
 */
package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

/**
 * doit être surclassé par une entrée type (warcaster, unit, ...)
 * @author S0085289
 *
 */
public abstract class ArmyElement implements Serializable {

	/** if FA = MAX_FA, then FA = "U" 
	 * @see unlimitedFA
	 */
	public static final int MAX_FA = 512; 
	
	/** if FA = C_FA && uniqueCharacter==true , then FA = "C" 
	 * @see uniqueCharacter
	 */
	public static final int C_FA = 1; 

	/** unique name .. identifier! */
	private String id;

	/** unique name  */
	private String name;
	
	/** full name */
	private String fullName;
	
	/** subtitle : ex. PROTECTORATE HEAVY CHARACTER WARJACK */
	private String qualification;
	
	/** affiliate faction */
	private FactionNamesEnum faction;
	
	private ArrayList<String> allowedFactionsToWorkFor = new ArrayList<String>();
	
	
	/** field allowance  1 = 'C' si uniqueCharacter = true */
	private int FA;
	
	/** unique = FA : C */
	private boolean uniqueCharacter = false; 
	
	/** FA : U */
	private boolean unlimitedFA;
	
	/** indique qu'il s'agit d'un attachment */
	private boolean attachment;

	private List<SingleModel> models = new ArrayList<SingleModel>();
	
	/**
	 * this is the id of another model which is automatically added in the list with this model
	 */
	private String companionId;

	/**
	 * the formatted text on the back of the card
	 */
	private String cardFullText;
	/**
	 * renvoie le type réel
	 * @return
	 */
	public abstract ModelTypeEnum getModelType();
	
	/** if standard cost (not warcaster/warlock/free attachment) */
	public abstract boolean hasStandardCost();
	
	/** base cost for one model or min Unit */
	public abstract int getBaseCost();

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getFullName() {
		return fullName;
	}

	public void setFullName(String fullName) {
		this.fullName = fullName;
	}

	public int getFA() {
		return FA;
	}

	public void setFA(int fA) {
		FA = fA;
	}

	public boolean isUniqueCharacter() {
		return uniqueCharacter;
	}

	public void setUniqueCharacter(boolean uniqueCharacter) {
		this.uniqueCharacter = uniqueCharacter;
	}

	public boolean isAttachment() {
		return attachment;
	}

	public void setAttachment(boolean attachment) {
		this.attachment = attachment;
	}

	public void setFaFromXml(String fa) {
		if ("C".equals(fa)) {
			setFA(C_FA);
			setUniqueCharacter(true);
		} else if ("U".equals(fa)) {
			setFA(MAX_FA);
			setUnlimitedFA(true);
		} else {
			try {
				setFA(Integer.parseInt(fa));
			} catch (Exception e) {
				setFA(0);
			}
		}
	}

	public boolean isUnlimitedFA() {
		return unlimitedFA;
	}

	public void setUnlimitedFA(boolean unlimitedFA) {
		this.unlimitedFA = unlimitedFA;
	}

	public FactionNamesEnum getFaction() {
		return faction;
	}

	public void setFaction(FactionNamesEnum faction) {
		this.faction = faction;
	}


	public String getQualification() {
		return qualification;
	}

	public void setQualification(String qualification) {
		this.qualification = qualification;
	}

	public List<SingleModel> getModels() {
		return models;
	}

	public void setModels(List<SingleModel> models) {
		this.models = models;
	}

	public String getCardFullText() {
		return cardFullText;
	}

	public void setCardFullText(String cardFullText) {
		this.cardFullText = cardFullText;
	}

	/**
	 * return true if one or more models in the unit (including UA & WA) may have many hitpoints
	 * @return
	 */
	public boolean hasMultiPVModels() {
		for (SingleModel model : getModels()) {
			if (model.getHitpoints().getTotalHits() > 1) {
				return true;
			}
		}
		return false;
	}

	public ArrayList<String> getAllowedFactionsToWorkFor() {
		return allowedFactionsToWorkFor;
	}

	public String getCompanionId() {
		return companionId;
	}

	public void setCompanionId(String companionId) {
		this.companionId = companionId;
	}

	public String toString() {
		return fullName;
	}
	
}
