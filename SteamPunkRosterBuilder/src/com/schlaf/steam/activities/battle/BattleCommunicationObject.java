package com.schlaf.steam.activities.battle;

import java.io.Serializable;
import java.util.Date;

import com.schlaf.steam.data.DamageGrid;

public class BattleCommunicationObject implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3807958778896755860L;

	private Date timeStamp;
	
	private BattleEntry battleEntry;
	
	private DamageGrid damageGrid;

	private CommAction action;

	public BattleCommunicationObject() {
		timeStamp = new Date();
	}
	
	public Date getTimeStamp() {
		return timeStamp;
	}

	public void setTimeStamp(Date timeStamp) {
		this.timeStamp = timeStamp;
	}

	public BattleEntry getBattleEntry() {
		return battleEntry;
	}

	public void setBattleEntry(BattleEntry battleEntry) {
		this.battleEntry = battleEntry;
	}

	public CommAction getAction() {
		return action;
	}

	public void setAction(CommAction action) {
		this.action = action;
	}

	public DamageGrid getDamageGrid() {
		return damageGrid;
	}

	public void setDamageGrid(DamageGrid damageGrid) {
		this.damageGrid = damageGrid;
	}
	
	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append(action).append("-");
		if (battleEntry != null) {
			sb.append(battleEntry.toString());
		}
		if (damageGrid != null) {
			sb.append(damageGrid.toString());
		}
		return sb.toString();
	}
	
}
