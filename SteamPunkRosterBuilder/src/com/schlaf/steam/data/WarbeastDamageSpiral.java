/**
 * 
 */
package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.StringTokenizer;

import android.graphics.Color;

import com.schlaf.steam.activities.battle.MiniModelDescription;
import com.schlaf.steam.activities.damages.DamageStatus;

/**
 * @author S0085289
 *
 */
public class WarbeastDamageSpiral extends DamageGrid {

	/**
	 * serial
	 */
	private static final long serialVersionUID = 2686768067136889492L;
	
	
	/** inventaire des branches */
	HashMap<AspectEnum, DamageBranch> branches = new HashMap<WarbeastDamageSpiral.AspectEnum, DamageBranch>();
	
	/**
	 * keep tracks of circles with damages, usefull for damage deletion.
	 */
	private List<DamageCircle> justDamagedCircles = new ArrayList<WarbeastDamageSpiral.DamageCircle>();
	
	/**
	 * branch damage for horde spiral
	 * @author S0085289
	 *
	 */
	public class DamageBranch implements Serializable {
		/**
		 * 
		 */
		private static final long serialVersionUID = -3947930847213812861L;
		AspectEnum aspect;
		List<DamageCircle> circlesLittle; // branch 1, 3, 5
		List<DamageCircle> circlesBig; // branch 2, 4, 6
		List<DamageCircle> circlesInner; // inner branch (common to 1-2, 3-4 and 5-6)
		
		public DamageBranch(AspectEnum aspect, int nbDamages,  WarbeastDamageSpiral warbeastDamageSpiral) {
			
			int nbCirclesLittle = (nbDamages - 2) / 2 + (nbDamages - 2) % 2 ;
			int nbCirclesBig = (nbDamages - 2) / 2 ;
			int nbCirclesInner = 2;
			
			this.aspect = aspect;
			circlesLittle = new ArrayList<WarbeastDamageSpiral.DamageCircle>(nbCirclesLittle);
			circlesBig = new ArrayList<WarbeastDamageSpiral.DamageCircle>(nbCirclesBig);
			circlesInner = new ArrayList<WarbeastDamageSpiral.DamageCircle>(nbCirclesInner);
			for (int i = 0; i < nbCirclesLittle; i++) {
				circlesLittle.add(new DamageCircle(i, warbeastDamageSpiral));
			}
			for (int i = 0; i < nbCirclesBig; i++) {
				circlesBig.add(new DamageCircle(i, warbeastDamageSpiral));
			}
			for (int i = 0; i < nbCirclesInner; i++) {
				circlesInner.add(new DamageCircle(i, warbeastDamageSpiral));
			}
		}

		
		public DamageStatus getDamageStatus() {
			int nbHits = 0;
			int nbDamages = 0;
			for (DamageCircle box : circlesLittle) {
				nbHits ++;
				if (box.isDamaged()) {
					nbDamages ++;
				}
			}
			for (DamageCircle box : circlesBig) {
				nbHits ++;
				if (box.isDamaged()) {
					nbDamages ++;
				}
			}
			for (DamageCircle box : circlesInner) {
				nbHits ++;
				if (box.isDamaged()) {
					nbDamages ++;
				}
			}
			
			return new DamageStatus(nbHits, nbDamages, aspect.name());
		}
		
		public DamageStatus getDamagePendingStatus() {
			int nbHits = 0;
			int nbDamages = 0;
			for (DamageCircle box : circlesLittle) {
				nbHits ++;
				if (box.isDamagedPending() || (box.isDamaged() && ! box.isCurrentlyChangePending()) ) {
					nbDamages ++;
				}
			}
			for (DamageCircle box : circlesBig) {
				nbHits ++;
				if (box.isDamagedPending() || (box.isDamaged() && ! box.isCurrentlyChangePending())) {
					nbDamages ++;
				}
			}
			for (DamageCircle box : circlesInner) {
				nbHits ++;
				if (box.isDamagedPending() || (box.isDamaged() && ! box.isCurrentlyChangePending())) {
					nbDamages ++;
				}
			}
			
			return new DamageStatus(nbHits, nbDamages, aspect.name());
		
		}
		
		/**
		 * return true if at least one damageCircle not damaged in the branch
		 * @return
		 */
		public boolean isStillAlive() {
			for (DamageCircle circle :circlesBig) {
				if ( ! circle.isDamaged()) {
					return true;
				}
			}
			for (DamageCircle circle :circlesLittle) {
				if ( ! circle.isDamaged()) {
					return true;
				}
			}
			for (DamageCircle circle :circlesInner) {
				if ( ! circle.isDamaged()) {
					return true;
				}
			}
			return false;
		}
		
		public boolean canTakeDamages() {
			for (DamageCircle circle :circlesBig) {
				if ( ! circle.isDamaged() && !circle.isDamagedPending() && !circle.isCurrentlyChangePending()) {
					return true;
				}
			}
			for (DamageCircle circle :circlesLittle) {
				if ( ! circle.isDamaged() && !circle.isDamagedPending() && !circle.isCurrentlyChangePending()) {
					return true;
				}
			}
			for (DamageCircle circle :circlesInner) {
				if ( ! circle.isDamaged() && !circle.isDamagedPending() && !circle.isCurrentlyChangePending()) {
					return true;
				}
			}
			return false;
		}

		
		public String toString() {
			StringBuffer sb = new StringBuffer();
			sb.append("[").append(aspect).append(":");
			for (DamageCircle circle : circlesLittle ) {
				sb.append(circle.damaged?"X":"O");	
			}
			sb.append("/");
			for (DamageCircle circle : circlesInner) {
				sb.append(circle.damaged?"X":"O");	
			}
			sb.append("-");
			for (DamageCircle circle : 			circlesBig) {
				sb.append(circle.damaged?"X":"O");	
			}
			sb.append("]");
			return sb.toString();
		}

		public AspectEnum getAspect() {
			return aspect;
		}

		public List<DamageCircle> getCirclesLittle() {
			return circlesLittle;
		}

		public List<DamageCircle> getCirclesBig() {
			return circlesBig;
		}

		public List<DamageCircle> getCirclesInner() {
			return circlesInner;
		}

		/**
		 * apply damages to the branch. if "inner", then apply to first part then report on the other part;
		 * if "outer", apply just on the outer + inner part.
		 * @param dmg
		 * @param inner
		 * @return
		 */
		public int applyFakeDamages(int dmg, boolean inner) {
			
			System.out.println("BRANCH : addDamage, col = " + (inner?""+aspect.getBranchId1():""+aspect.branchId2) + " - DMG = " + dmg);
			int dmgApplied = 0;
			if (inner) {
				dmgApplied = applyPartialFakeDamage(dmg, circlesLittle);
			} else {
				dmgApplied += applyPartialFakeDamage(dmg, circlesBig);
			}
			
			if (dmgApplied < dmg) {
				dmgApplied += applyPartialFakeDamage(dmg - dmgApplied, circlesInner);
			}
			return dmgApplied;
		}

		/** 
		 * apply damage to sub-branch
		 * @param dmg
		 * @param subBranch
		 * @return
		 */
		private int applyPartialFakeDamage(int dmg, List<DamageCircle> subBranch) {
			
			System.out.println("subBRANCH : addDamage, - DMG = " + dmg);
			int dmgApplied = 0;
			
			Collections.sort(subBranch);
			Collections.reverse(subBranch); // il faut commencer par l'ext�rieur de la grille...
			
			for (DamageCircle circle : subBranch) {
				if (dmgApplied < dmg) {
					if (! circle.isDamaged() && !circle.isDamagedPending()) {
						circle.addPendingDamage();
						dmgApplied ++;
					}
				}
			}
			
			Collections.sort(subBranch); // il faut remettre � l'endroit!
			
			return dmgApplied;
		}

		
	}

	/** damage box for horde spiral */
	public class DamageCircle implements Comparable<DamageCircle>, Serializable {
		
		/**
		 * 
		 */
		private static final long serialVersionUID = 2310611302172933492L;

		boolean damaged = false;
		
		/** indicates a change is pending, but not committed */
		private boolean currentlyChangePending;
		/** indicates this box is "virtually" damaged (waiting to confirm status) */
		private boolean damagedPending;

		
		/** 1 au centre, xx aux extr�mit�s */
		int id;
		
		private WarbeastDamageSpiral parent;
		
		public DamageCircle(int id, WarbeastDamageSpiral parent) {
			this.id = id;
			this.parent = parent;
		}

		public boolean isDamaged() {
			return damaged;
		}

		public void setDamaged(boolean damaged) {
			this.damaged = damaged;
		}
		
		@Override
		public int compareTo(DamageCircle another) {
			return id - another.id;
		}
		
		/**
		 * invert damage
		 */
		public void flipFlop() {
			if (currentlyChangePending) {
				currentlyChangePending = false; // restore status
				damagedPending = damaged;
			} else {
				damagedPending = !damaged;
				currentlyChangePending = true;
			}
			parent.notifyBoxChange();
		}
		
		public void addPendingDamage() {
			damagedPending = true;
			currentlyChangePending = true;
			parent.justDamagedCircles.add(this);
			parent.notifyBoxChange();
		}
		
		public String toString() {
			if (currentlyChangePending) {
				if (damagedPending) {
					return "(R)";
				} else {
					return "(G)";
				}
			}
			if (damaged) {
				return "(X)";
			} else {
				return "( )";
			}
		}

		public boolean isCurrentlyChangePending() {
			return currentlyChangePending;
		}

		public void setCurrentlyChangePending(boolean currentlyChangePending) {
			this.currentlyChangePending = currentlyChangePending;
			parent.notifyBoxChange();
		}

		public boolean isDamagedPending() {
			return damagedPending;
		}

		public void setDamagedPending(boolean damagedPending) {
			this.damagedPending = damagedPending;
			parent.notifyBoxChange();
		}
		
	}

	public enum AspectEnum {
		
		MIND(1,2, Math.PI * 2 / 3, Color.CYAN),
		BODY(3,4, Math.PI * 4 / 3, Color.RED),
		SPIRIT(5,6, 0, Color.GREEN);
		
		private int branchId1;
		private int branchId2;
		// angle de d�calage pour l'affichage
		private double theta; 
		private int color;

		private AspectEnum(int branchId1, int branchId2, double theta, int color) {
			this.branchId1 = branchId1;
			this.branchId2 = branchId2;
			this.theta = theta;
			this.color = color;
		}
		
		/** 
		 * renvoie la branche associ�e � l'id de colonne
		 * @param id
		 * @return
		 */
		public static AspectEnum getFromBranchId(int id) {
			for (AspectEnum value : values()) {
				if (   (value.branchId1 == id) || (value.branchId2 == id)) {
					return value;
				}
			}
			return null;
		}

		public int getBranchId1() {
			return branchId1;
		}

		public int getBranchId2() {
			return branchId2;
		}

		public double getTheta() {
			return theta;
		}

		public int getColor() {
			return color;
		}
	}	
	
	public WarbeastDamageSpiral(SingleModel beast) {
		this.model = new MiniModelDescription(beast);
	}

	
	@Override
	public DamageGrid fromString(String grid) {
		// grid = "7-8-7"
		// String grid = "SPIRIT:4/2-3;BODY:5/2-6;MIND:4/2-4";
		// format : "<aspect>:<first_colum_outer>/<first_column_inner>-<second_column>;<aspect>....
		
		StringTokenizer stk = new StringTokenizer(grid, "-");
		
		int aspectOrdinal = 1;
		while (stk.hasMoreTokens()) {
			
			int aspectDamages = Integer.parseInt(stk.nextToken());
			
			AspectEnum aspect = null;
			switch (aspectOrdinal) {
				case 1 :{
					aspect = AspectEnum.MIND;
					break;
				}
				case 2 :{
					aspect = AspectEnum.BODY;
					break;
				}
				case 3 :{
					aspect = AspectEnum.SPIRIT;
					break;
				}
			}
			
			DamageBranch branch = new DamageBranch( aspect, aspectDamages, this );
			
			aspectOrdinal++;
			
			branches.put(aspect, branch);
		}
		
		
		
		return this;
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
	
	@Override
	public int applyFakeDamages(int damageAmount) {
		return 0;
	}


	@Override
	public int getTotalHits() {
		return getDamageStatus().getHitPoints();
	}

	@Override
	public DamageStatus getDamageStatus() {
		int nbHits = 0;
		int nbDamages = 0;
		for (DamageBranch branch : getBranches().values()) {
			DamageStatus dmg = branch.getDamageStatus();
			nbHits += dmg.getHitPoints();
			nbDamages += dmg.getDamagedPoints();
		}
		return new DamageStatus(nbHits, nbDamages, "");
	}

	@Override
	public void commitFakeDamages() {
		for (DamageBranch branch : getBranches().values()) {
			for ( DamageCircle circle : branch.getCirclesBig()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamaged(circle.isDamagedPending());
					circle.setCurrentlyChangePending(false);
				}
			}
			for ( DamageCircle circle : branch.getCirclesLittle()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamaged(circle.isDamagedPending());
					circle.setCurrentlyChangePending(false);
				}
			}
			for ( DamageCircle circle : branch.getCirclesInner()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamaged(circle.isDamagedPending());
					circle.setCurrentlyChangePending(false);
				}
			}
		}
		
		justDamagedCircles = new ArrayList<WarbeastDamageSpiral.DamageCircle>();
		
		notifyCommit();
		
	}

	@Override
	public void resetFakeDamages() {
		for (DamageBranch branch : getBranches().values()) {
			for ( DamageCircle circle : branch.getCirclesBig()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamagedPending(circle.isDamaged());
					circle.setCurrentlyChangePending(false);
				}
			}
			for ( DamageCircle circle : branch.getCirclesLittle()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamagedPending(circle.isDamaged());
					circle.setCurrentlyChangePending(false);
				}
			}
			for ( DamageCircle circle : branch.getCirclesInner()) {
				if (circle.isCurrentlyChangePending()) {
					circle.setDamagedPending(circle.isDamaged());
					circle.setCurrentlyChangePending(false);
				}
			}	
		}
		justDamagedCircles = new ArrayList<WarbeastDamageSpiral.DamageCircle>();
	}

	@Override
	public int applyFakeDamages(int column, int damageAmount) {

		int dmgApplied = 0;
		if (damageAmount > 0) {
			for (DamageBranch branch : getBranches().values()) {
				if (branch.getAspect().getBranchId1() == column) {
					dmgApplied = branch.applyFakeDamages(damageAmount, true);
				} else if (branch.getAspect().getBranchId2() == column)  {
					dmgApplied = branch.applyFakeDamages(damageAmount, false);
				}
			}
			
			if (dmgApplied < damageAmount && isStillAlivePending()) {
				if (column < 6) {
					column++;
				} else {
					column = 1;
				}
				dmgApplied += applyFakeDamages(column, damageAmount - dmgApplied);
			}
			
		} else {
			// remove damage
			for (int i = justDamagedCircles.size() - 1; i >=0 && damageAmount < 0 ; i--) {
				justDamagedCircles.get(i).setCurrentlyChangePending(false);
				justDamagedCircles.get(i).setDamagedPending(false);
				damageAmount++;
				dmgApplied++;
				justDamagedCircles.remove(i);
			}
		}
		
		return dmgApplied;
	}

	public HashMap<AspectEnum, DamageBranch> getBranches() {
		return branches;
	}


	public DamageStatus getNbHitPointsAspect(AspectEnum aspect) {
		return getBranches().get(aspect).getDamageStatus();
	}
	
	public DamageStatus getDamagePendingStatus() {
		int nbHits = 0;
		int nbDamages = 0;
		for (DamageBranch branch : getBranches().values()) {
			DamageStatus dmg = branch.getDamagePendingStatus();
			nbHits += dmg.getHitPoints();
			nbDamages += dmg.getDamagedPoints();
		}
		return new DamageStatus(nbHits, nbDamages, "");

	}


	@Override
	public void copyStatusFrom(DamageGrid damageGrid) {
		// TODO Auto-generated method stub
		
	}

}


