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
public class Warjack extends ArmyElement implements Serializable, Restrictable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2019706236397270677L;

	private int baseCost;
	
	/** textual represenation of damage grid */
	private String grid;
	
	private ArrayList<String> allowedCastersToWorkFor = new ArrayList<String>();
	
	@Override
	public ModelTypeEnum getModelType() {
		// TODO Auto-generated method stub
		return ModelTypeEnum.WARJACK;
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

	public String getGrid() {
		return grid;
	}

	public void setGrid(String grid) {
		this.grid = grid;
	}

	public ArrayList<String> getAllowedEntriesToAttach() {
		return allowedCastersToWorkFor;
	}
	
	
	
}
