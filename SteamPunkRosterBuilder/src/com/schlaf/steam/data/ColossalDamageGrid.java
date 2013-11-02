package com.schlaf.steam.data;

import java.util.ArrayList;
import java.util.List;

import com.schlaf.steam.activities.battle.MiniModelDescription;
import com.schlaf.steam.activities.damages.DamageStatus;

public class ColossalDamageGrid extends WarjackLikeDamageGrid {

	/**
	 * 
	 */
	private static final long serialVersionUID = -2943574784945930361L;
	
	private WarjackDamageGrid leftGrid;
	private WarjackDamageGrid rightGrid;
	
	public ColossalDamageGrid(SingleModel jack) {
		this.model = new MiniModelDescription(jack);
	}
	
	@Override
	public DamageGrid fromString(String damageGridString) {
		// TODO Auto-generated method stub
		return null;
	}
	@Override
	public int applyFakeDamages(int damageAmount) {
		// no usage without column
		return 0;
	}
	@Override
	public int applyFakeDamages(int column, int damageAmount) {
		if (column >=0 && column < 6) {
			return leftGrid.applyFakeDamages(column, damageAmount);
		} else if (column >=6 && column <12 ) {
			return rightGrid.applyFakeDamages(column-6, damageAmount);
		} else {
			return 0;
		}
	}

	@Override
	public void commitFakeDamages() {
		leftGrid.commitFakeDamages();
		rightGrid.commitFakeDamages();
		
		notifyCommit();

	}
	@Override
	public void resetFakeDamages() {
		leftGrid.resetFakeDamages();
		rightGrid.resetFakeDamages();
	}
	@Override
	public int getTotalHits() {
		return leftGrid.getTotalHits() + rightGrid.getTotalHits();
	}
	
	@Override
	public DamageStatus getDamageStatus() {
		DamageStatus leftDmg = leftGrid.getDamageStatus();
		DamageStatus rightDmg = rightGrid.getDamageStatus();
		int hitPoints = leftDmg.getHitPoints() + rightDmg.getHitPoints();
		int damagedPoints = leftDmg.getDamagedPoints() + rightDmg.getDamagedPoints();
		return new DamageStatus(hitPoints, damagedPoints, "");
	}
	
	public DamageStatus getDamagePendingStatus() {
		DamageStatus leftDmg = leftGrid.getDamagePendingStatus();
		DamageStatus rightDmg = rightGrid.getDamagePendingStatus();
		int hitPoints = leftDmg.getHitPoints() + rightDmg.getHitPoints();
		int damagedPoints = leftDmg.getDamagedPoints() + rightDmg.getDamagedPoints();
		return new DamageStatus(hitPoints, damagedPoints, "");
	}
	
	public WarjackDamageGrid getLeftGrid() {
		return leftGrid;
	}
	public void setLeftGrid(WarjackDamageGrid leftGrid) {
		this.leftGrid = leftGrid;
	}
	public WarjackDamageGrid getRightGrid() {
		return rightGrid;
	}
	public void setRightGrid(WarjackDamageGrid rightGrid) {
		this.rightGrid = rightGrid;
	}

	public List<WarmachineDamageSystemsEnum> getSystems() {
		ArrayList<WarmachineDamageSystemsEnum> result = new ArrayList<WarmachineDamageSystemsEnum>();
		for (DamageColumn column : leftGrid.getColumns()) {
			for (DamageBox box : column.getBoxes()) {
				if (! box.getSystem().equals(WarmachineDamageSystemsEnum.EMPTY)) {
					if (! result.contains(box.getSystem())) {
						result.add(box.getSystem());
					}
				}
			}
		}
		for (DamageColumn column : rightGrid.getColumns()) {
			for (DamageBox box : column.getBoxes()) {
				if (! box.getSystem().equals(WarmachineDamageSystemsEnum.EMPTY)) {
					if (! result.contains(box.getSystem())) {
						result.add(box.getSystem());
					}
				}
			}
		}
		return result;	
	}

	public DamageStatus getNbHitPointsSystem(WarmachineDamageSystemsEnum system) {
		DamageStatus leftDmg = leftGrid.getNbHitPointsSystem(system);
		DamageStatus rightDmg = rightGrid.getNbHitPointsSystem(system);
		int hitPoints = leftDmg.getHitPoints() + rightDmg.getHitPoints();
		int damagedPoints = leftDmg.getDamagedPoints() + rightDmg.getDamagedPoints();
		return new DamageStatus(hitPoints, damagedPoints, "");

	}

	@Override
	public void copyStatusFrom(DamageGrid damageGrid) {
		// TODO Auto-generated method stub
		
	}
}
