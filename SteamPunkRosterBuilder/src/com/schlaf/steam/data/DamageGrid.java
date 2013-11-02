package com.schlaf.steam.data;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

import com.schlaf.steam.activities.battle.MiniModelDescription;
import com.schlaf.steam.activities.damages.DamageChangeObserver;
import com.schlaf.steam.activities.damages.DamageCommitObserver;
import com.schlaf.steam.activities.damages.DamageStatus;

public abstract class DamageGrid implements Serializable {

	/** serial */
	private static final long serialVersionUID = 6848255206338757302L;

	/** the model that has this grid */
	protected MiniModelDescription model;
	
	protected int uniqueId; // to emit changes trough bluetooth
	
	transient List<DamageChangeObserver> observers = new ArrayList<DamageChangeObserver>();
	transient List<DamageCommitObserver> commitObservers = new ArrayList<DamageCommitObserver>();
	
	/**
	 * create the grid/spiral from String
	 * @param damageGridString
	 * @return
	 */
	public abstract DamageGrid fromString(String damageGridString);
	
	/**
	 * ajoute des faux dommages (pending) à la ligne existante
	 * @param colNumber
	 * @param nbDamage
	 * @return nb damages applied
	 */
	public abstract int applyFakeDamages(int damageAmount);
	
	/**
	 * ajoute des faux dommages (pending) à la grilleexistante
	 * @param colNumber
	 * @param nbDamage
	 * @return nb damages applied
	 */
	public abstract int applyFakeDamages(int column, int damageAmount);

	/**
	 * transform fake damages to real ones.
	 */
	public abstract void commitFakeDamages();
	
	/**
	 * erase all fake damages
	 */
	public abstract void resetFakeDamages();
	
	/**
	 * must be called whenever an operation is made on a damageBox 
	 */
	public final void notifyBoxChange() {
		if (observers != null) {
			for (DamageChangeObserver observer : observers) {
				observer.onChangeDamageStatus(this);
			}
		}
	}
	
	public final void notifyCommit() {
		if (commitObservers != null) {
			for (DamageCommitObserver observer : commitObservers) {
				observer.onCommitChangeDamageStatus(this);
			}
		}
	}

	/**
	 * register an observer of this grid
	 * @param observer
	 */
	public void registerObserver(DamageChangeObserver observer) {
		if (observers == null) {
			observers = new ArrayList<DamageChangeObserver>();
		}
		observers.add(observer);
	}
	
	/**
	 * register an observer of this grid
	 * @param observer
	 */
	public void registerCommitObserver(DamageCommitObserver observer) {
		if (commitObservers == null) {
			commitObservers = new ArrayList<DamageCommitObserver>();
		}
		commitObservers.add(observer);
	}

	/**
	 * return total of hits
	 */
	public abstract int getTotalHits() ;
	
	/**
	 * return damage status
	 * @return
	 */
	public abstract DamageStatus getDamageStatus();
	

	public MiniModelDescription getModel() {
		return model;
	}

	public int getUniqueId() {
		return uniqueId;
	}

	public void setUniqueId(int newId) {
		if (uniqueId != 0) {
			throw new UnsupportedOperationException("unique id for DamageGrid must be set only once! ");
		}
		this.uniqueId = newId;
	}

	public abstract void copyStatusFrom(DamageGrid damageGrid) ;

}
