/**
 * 
 */
package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;

/**
 * @author S0085289
 *
 */
public class Solo extends ArmyElement implements Serializable, Restrictable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1287377807715612909L;

	private int baseCost;
	
	/** 
	 * if solo must be attached to another model 
	 */
	private boolean warcasterAttached;
	
	/**
	 * must be attached to a mercenary unit (valachev, attendant priest, ...)
	 */
	private boolean mercenaryUnitAttached;
	
	/**
	 * can be attached to some unit, not specifically to one. see "restrictions" to see which unit can have the solo 
	 */
	private boolean genericUnitAttached;
	
	/** if dragoon, gains an alternate profile (dismounted) and (optionally) an alternate cost (with dismount option) */
	private boolean dragoon;
	
	/** if dragoon and has dismount option */
	private boolean dismountOption;
	
	/** cost with dismount option */
	private int dismountCost;
	
	
	/** if solo is an attachment, list the units it can be attached to */
	private ArrayList<String> allowedUnitsToAttach = new ArrayList<String>();
	
	
	@Override
	public ModelTypeEnum getModelType() {
		return ModelTypeEnum.SOLO;
	}

	@Override
	public boolean hasStandardCost() {
		return true;
	}

	@Override
	public int getBaseCost() {
		return baseCost;
	}

	public void setBaseCost(int baseCost) {
		this.baseCost = baseCost;
	}

	public boolean isDragoon() {
		return dragoon;
	}

	public void setDragoon(boolean dragoon) {
		this.dragoon = dragoon;
	}

	public boolean isDismountOption() {
		return dismountOption;
	}

	public void setDismountOption(boolean dismountOption) {
		this.dismountOption = dismountOption;
	}

	public int getDismountCost() {
		return dismountCost;
	}

	public void setDismountCost(int dismountCost) {
		this.dismountCost = dismountCost;
	}

	public boolean isWarcasterAttached() {
		return warcasterAttached;
	}

	public void setWarcasterAttached(boolean warcasterAttached) {
		this.warcasterAttached = warcasterAttached;
	}

	public boolean isMercenaryUnitAttached() {
		return mercenaryUnitAttached;
	}

	public void setMercenaryUnitAttached(boolean mercenaryUnitAttached) {
		this.mercenaryUnitAttached = mercenaryUnitAttached;
	}

	public boolean isGenericUnitAttached() {
		return genericUnitAttached;
	}

	public void setGenericUnitAttached(boolean genericUnitAttached) {
		this.genericUnitAttached = genericUnitAttached;
	}

	@Override
	public ArrayList<String> getAllowedEntriesToAttach() {
		return allowedUnitsToAttach;
	}
	
	
	
}
