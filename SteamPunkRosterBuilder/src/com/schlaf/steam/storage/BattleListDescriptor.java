package com.schlaf.steam.storage;

import com.schlaf.steam.activities.battle.BattleSingleton;
import com.schlaf.steam.data.FactionNamesEnum;

public class BattleListDescriptor implements Comparable<BattleListDescriptor> {

	private String filename;
	private String title;
	private FactionNamesEnum faction1;
	private String faction1Description;
	private FactionNamesEnum faction2;
	private String faction2Description;
	boolean twoPlayers = false;
	

	public BattleListDescriptor(BattleStore store) {
		super();
		this.title = store.getTitle();
		this.filename = store.getFilename();

		ArmyStore army1 = store.getArmy(BattleSingleton.PLAYER1);
		ArmyStore army2 = store.getArmy(BattleSingleton.PLAYER2);
		
		this.faction1 = FactionNamesEnum.getFaction(army1.getFactionId());
		ArmyListDescriptor ald = new ArmyListDescriptor(army1);
		faction1Description = ald.getDescription();

		if (army2 != null) {
			this.faction2 = FactionNamesEnum.getFaction(army2.getFactionId());
			ArmyListDescriptor ald2 = new ArmyListDescriptor(army2);
			faction2Description = ald2.getDescription();
			twoPlayers = true;
		} 
	}

	public String toString() {
		StringBuffer sb = new StringBuffer();
		sb.append(title).append(" (").append(faction1Description).append(")");
		if (faction2Description != null) {
			sb.append(" -- (").append(faction2Description).append(")");
		}
				
		return sb.toString();
	}

	private int getOrderingOffsetTwoPlayer() {
		if (isTwoPlayers()) {
			return -10000;
		}
		return 0;
	}

	public String getFilename() {
		return filename;
	}

	public void setFilename(String filename) {
		this.filename = filename;
	}

	public String getTitle() {
		return title;
	}

	public String getDescription() {
		StringBuffer sb = new StringBuffer();


		return sb.toString();
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public FactionNamesEnum getFaction1() {
		return faction1;
	}

	public String getFaction1Description() {
		return faction1Description;
	}

	public FactionNamesEnum getFaction2() {
		return faction2;
	}

	public String getFaction2Description() {
		return faction2Description;
	}

	public boolean isTwoPlayers() {
		return twoPlayers;
	}

	@Override
	public int compareTo(BattleListDescriptor another) {
		int firstCompare =  getOrderingOffsetTwoPlayer() - another.getOrderingOffsetTwoPlayer() +
				faction1.compareTo(another.getFaction1());
		if (firstCompare == 0) {
			return title.compareTo(another.getTitle());
		} else {
			return firstCompare;
		}
	}

}
