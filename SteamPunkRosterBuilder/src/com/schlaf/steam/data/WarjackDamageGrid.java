/**
 * 
 */
package com.schlaf.steam.data;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

import android.util.Log;

import com.schlaf.steam.activities.battle.MiniModelDescription;
import com.schlaf.steam.activities.damages.DamageStatus;

/**
 * @author S0085289
 *
 */
public class WarjackDamageGrid extends WarjackLikeDamageGrid {

	/**
	 * 
	 */
	private static final long serialVersionUID = 6769715584560126726L;

	private static final String TAG = "WarjackDamageGrid";
	
	private DamageColumn[] columns = new DamageColumn[6];
	
	/**
	 * total number of hit points
	 */
	private int hitPoints;
	
	private String damageGridString;
	
	/**
	 * number of damaged boxes
	 */
	private int damagedPoints;
	
	public WarjackDamageGrid(SingleModel jack) {
		this.model = new MiniModelDescription(jack);
		for (int i = 0; i < columns.length; i++) {
			columns[i] = new DamageColumn();
			columns[i].setId(i);
		}
	}
	
	@Override
	public DamageGrid fromString(String damageGridString) {
		// "x....x.............L..R.LLMCRRxMMCCx"
		this.damageGridString = damageGridString;
		
		char[] charArray = damageGridString.toCharArray();
		for (int i = 0 ; i < charArray.length; i++) {
			// compute column
			int columnId = i%6;
			columns[columnId].getBoxes().add(new DamageBox(String.valueOf(charArray[i]), this));
		}
		
		getDamageStatus();
		return this;
	}

	
	public String toString() {
		StringBuffer sb = new StringBuffer(64);
		for (int i = 0; i < 6; i++) {
			for (DamageColumn column : columns) {
				sb.append(column.getBoxes().get(i).getSystem().getCode());
			}
			sb.append("\n");
		}
		return sb.toString();
	}
	
	/**
	 * return true if at least one damageCircle not damaged in the branch
	 * @return
	 */
	public boolean isStillAlive() {
		DamageStatus status = getDamageStatus();
		if (status.getDamagedPoints() < status.getHitPoints()) {
			return true;
		}
		return false;
	}
	
	/**
	 * return true if at least one damageCircle not damaged && not damagedPending in the branch
	 * @return
	 */
	public boolean isStillAlivePending() {
		DamageStatus status = getDamagePendingStatus();
		if (status.getDamagedPoints() < status.getHitPoints()) {
			return true;
		}
		return false;
	}
	
	
	public static void main(String[] args) {
		WarjackDamageGrid grid = new WarjackDamageGrid(null);
		grid.fromString("x....x.............L..R.LLMCRRxMMCCx");
	
		System.out.println(grid.toString());
	}

	public DamageColumn[] getColumns() {
		return columns;
	}
	
	public DamageStatus getDamageStatus() {
		int nbHits = 0;
		int nbDamages = 0;
		for (DamageColumn column : columns) {
			for (DamageBox box : column.getBoxes()) {
				if (! box.getSystem().equals(WarmachineDamageSystemsEnum.EMPTY)) {
					nbHits ++;
					if (box.isDamaged()) {
						nbDamages ++;
					}
				}
				
			}
		}
		
		hitPoints = nbHits;
		damagedPoints = nbDamages;
		
		return new DamageStatus(hitPoints, damagedPoints, "");
	}

	public DamageStatus getDamagePendingStatus() {
		int nbHits = 0;
		int nbDamages = 0;
		for (DamageColumn column : columns) {
			for (DamageBox box : column.getBoxes()) {
				if (! box.getSystem().equals(WarmachineDamageSystemsEnum.EMPTY)) {
					nbHits ++;
					if (box.isDamaged() || ( box.isCurrentlyChangePending() && box.isDamagedPending())) {
						nbDamages ++;
					}
				}
				
			}
		}
		
		hitPoints = nbHits;
		damagedPoints = nbDamages;
		
		return new DamageStatus(hitPoints, damagedPoints, "");
	}

	/**
	 * return the systems in this grid
	 * @return
	 */
	public List<WarmachineDamageSystemsEnum> getSystems() {
		
		ArrayList<WarmachineDamageSystemsEnum> result = new ArrayList<WarmachineDamageSystemsEnum>();
		for (DamageColumn column : columns) {
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
		int nbHits = 0;
		int nbDamages = 0;
		for (DamageColumn column : columns) {
			for (DamageBox box : column.getBoxes()) {
				
				if (box.getSystem().equals(system)) {
					nbHits ++;
					if (box.isDamaged()) {
						nbDamages ++;
					}
				}
				
			}
		}
		
		hitPoints = nbHits;
		damagedPoints = nbDamages;
		
		return new DamageStatus(hitPoints, damagedPoints, system.getCode());
	}

	@Override
	public int applyFakeDamages(int damageAmount) {
		return applyFakeDamages(0, damageAmount);
	}

	@Override
	public int applyFakeDamages(int colNumber, int damageAmount) {
		int dmgApplied = 0;

		if (damageAmount > 0) {
			for (DamageColumn column : columns) {
				if (column.getId() == colNumber) {
					dmgApplied = column.applyFakeDamages(damageAmount);
					if (dmgApplied == damageAmount) {
						// all damages applied, donne
						return dmgApplied;
					}
				}
			}

			if (dmgApplied != damageAmount && isStillAlivePending()) { // si on n'arrive
																// plus à infliger,
																// on stoppe
				// report sur la colonne suivante
				if (colNumber == 6) {
					dmgApplied += applyFakeDamages(0, damageAmount - dmgApplied);
				} else {
					dmgApplied += applyFakeDamages(colNumber + 1, damageAmount - dmgApplied);
				}
			}
		} else {
			// funky.. search for continuous damage from base column, then remove damages backward...
			ArrayList<DamageBox> damagedBoxToCleanList = new ArrayList<DamageBox>();
			
			// start with column at current column number...
			for (DamageColumn column : columns) {
				if (column.getId() >= colNumber) {
					for (DamageBox box : column.getBoxes()) {
						if (box.isCurrentlyChangePending() && box.isDamagedPending()) {
							damagedBoxToCleanList.add(box);
						}
					}
				}
			}
			// and continue from first column...
			for (DamageColumn column : columns) {
				if (column.getId() < colNumber) {
					for (DamageBox box : column.getBoxes()) {
						if (box.isCurrentlyChangePending() && box.isDamagedPending()) {
							damagedBoxToCleanList.add(box);
						}
					}
				}
			}
			
			for (int i = damagedBoxToCleanList.size() -1; i >=0; i--) {
				DamageBox box = damagedBoxToCleanList.get(i);
				if (dmgApplied < -damageAmount) {
					box.setCurrentlyChangePending(false);
					box.setDamagedPending(false);
					dmgApplied ++;	
				}
			}
			
		}
		
		notifyBoxChange();		
		return dmgApplied;

	}


	@Override
	public int getTotalHits() {
		return hitPoints;
	}

	@Override
	public void commitFakeDamages() {
		for (DamageColumn column : columns) {
			for (DamageBox box : column.getBoxes()) {
				if (box.isCurrentlyChangePending()) {
					box.setDamaged(box.isDamagedPending());
					box.setCurrentlyChangePending(false);
				}
			}
		}
		notifyCommit();
	}

	@Override
	public void resetFakeDamages() {
		for (DamageColumn column : columns) {
			for (DamageBox box : column.getBoxes()) {
				if (box.isCurrentlyChangePending()) {
					box.setDamagedPending(box.isDamaged());
					box.setCurrentlyChangePending(false);
				}
			}
		}
	}

	@Override
	public void copyStatusFrom(DamageGrid damageGrid) {
		if (damageGrid instanceof WarjackDamageGrid) {
			int colnum = 0;
			for (DamageColumn column : columns) {
				Iterator<DamageBox> sourceIt = ((WarjackDamageGrid) damageGrid).getColumns()[colnum].getBoxes().iterator();
				for (DamageBox box : column.getBoxes()) {
					DamageBox source = sourceIt.next();
					box.copyFrom(source);
				}
				colnum ++;
			}
		}
		Log.d(TAG, "damages applied by copy");
		notifyBoxChange();
	}

	public String getDamageGridString() {
		return damageGridString;
	}

}


