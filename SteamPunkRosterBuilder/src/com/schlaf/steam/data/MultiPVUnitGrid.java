package com.schlaf.steam.data;

import java.util.ArrayList;
import java.util.List;

import com.schlaf.steam.activities.damages.DamageStatus;
import com.schlaf.steam.activities.damages.ModelDamageLine;

public class MultiPVUnitGrid extends DamageGrid {

	/**
	 * 
	 */
	private static final long serialVersionUID = -1361881329712566530L;
	
	
	List<ModelDamageLine> damageLines = new ArrayList<ModelDamageLine>();
	
	@Override
	public DamageGrid fromString(String damageGridString) {
		return null;
	}

	@Override
	public int applyFakeDamages(int damageAmount) {
		throw new UnsupportedOperationException("can not apply damage without selecting model");
	}

	@Override
	public int applyFakeDamages(int column, int damageAmount) {
		int applied = damageLines.get(column).applyFakeDamages(damageAmount);
		notifyBoxChange();
		return applied;
		
	}

	@Override
	public void commitFakeDamages() {
		for (ModelDamageLine line : damageLines) {
			line.commitFakeDamages();
		}
		notifyBoxChange();
		notifyCommit();
	}

	@Override
	public void resetFakeDamages() {
		for (ModelDamageLine line : damageLines) {
			line.resetFakeDamages();
		}
		notifyBoxChange();
	}


	@Override
	public int getTotalHits() {
		return 0;
	}

	@Override
	public DamageStatus getDamageStatus() {
		// TODO Auto-generated method stub
		return null;
	}

	public List<ModelDamageLine> getDamageLines() {
		return damageLines;
	}
	
	public List<ModelDamageLine> getMultiPvDamageLines() {
		List<ModelDamageLine> result = new ArrayList<ModelDamageLine>();
		for (ModelDamageLine line : damageLines) {
			if (line.getTotalHits() > 1) {
				result.add(line);
			}
		}
		return result;
	}

	public void setDamageLines(List<ModelDamageLine> damageLines) {
		this.damageLines = damageLines;
	}

	@Override
	public void copyStatusFrom(DamageGrid damageGrid) {
		// TODO Auto-generated method stub
		
	}

}
