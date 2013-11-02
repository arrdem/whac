package com.schlaf.steam.activities.battle;

import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.SingleModel;

public abstract class MultiPVModel extends BattleEntry {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6901916809931733089L;

	protected MiniModelDescription model;
	
	/**
	 * every multiPV model has a grid. must be implemented by subclasses
	 * @return
	 */
	public abstract DamageGrid getDamageGrid();
	
	public MultiPVModel(ArmyElement entry, int entryCounter) {
		super(entry, entryCounter);
	}
	
	public MultiPVModel(SingleModel model, ArmyElement entry, String label,int entryCounter ) {
		super(entry, entryCounter);
		this.model = new MiniModelDescription(model);
		this.label = label;
	}

	public MiniModelDescription getModel() {
		return model;
	}

	@Override
	public boolean hasDamageGrid() {
		return true;
	}
	
}
