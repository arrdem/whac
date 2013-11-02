/**
 * 
 */
package com.schlaf.steam.activities.battle;

import java.util.ArrayList;
import java.util.List;

import android.os.SystemClock;
import android.util.Log;

import com.schlaf.steam.activities.chrono.ChronoData;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.storage.ArmyStore;

/**
 * @author S0085289
 *
 */
public class BattleSingleton {

	private static String TAG = "BattleSingleton"; 
	
	public static final int PLAYER1 = 1;
	public static final int PLAYER2 = 2;
	
	private static BattleSingleton singleton;
	
	/** current army */
	private ArmyStore player1Army;
	private ArmyStore player2Army;
	
	/**
	 * the actual army list
	 */
	private List<BattleEntry> player1entries = new ArrayList<BattleEntry>();
	private List<BattleEntry> player2entries = new ArrayList<BattleEntry>();
	
	private ChronoData player1Chrono = new ChronoData();
	private ChronoData player2Chrono = new ChronoData();
	
	/** show full screen chrono */
	private boolean fullScreenChrono;
	
	/**
	 * indicates that we are receiving army2 content
	 */
	private boolean loadingArmy2;
	private List<BattleEntry> player2loadingEntries = new ArrayList<BattleEntry>();
	
	
	/**
	 * the entry viewed/edited
	 */
	private BattleEntry currentEntry;
	
	/** currently viewed element */
	ArmyElement currentArmyElement;

	/** currently edited damage grid */
	DamageGrid currentGrid;
	
	MultiPVModel currentModel;
	
	private BattleSingleton() {
		super();
	}
	
	public static BattleSingleton getInstance() {
		if (singleton == null) {
			singleton = new BattleSingleton();
		}
		return singleton;
	}

	/**
	 * pause all chrono and reinit initial time
	 */
	public void reInitAndConfigChrono(int nbMinutes) {
		Log.d("BattleSingleton", "reInitAndConfigChrono nbMinutes = " + nbMinutes);
		long nbMillis = nbMinutes * 60 * 1000;
		Log.d("BattleSingleton", "reInitAndConfigChrono nbMillis = " + nbMillis);
		getPlayer1Chrono().setPaused(true);
		getPlayer1Chrono().setInitialPlayerTimeInMillis(nbMillis);
		
		getPlayer2Chrono().setPaused(true);
		getPlayer2Chrono().setInitialPlayerTimeInMillis(nbMillis);
	}
	
	public List<BattleEntry> getEntries(int nbPlayer) {
		if (nbPlayer == 1) {
			return player1entries;
		} else {
			return player2entries;
		}
	}
	
	public BattleEntry getCurrentEntry() {
		return currentEntry;
	}

	public void setCurrentEntry(BattleEntry currentEntry) {
		this.currentEntry = currentEntry;
	}

	public ArmyElement getCurrentArmyElement() {
		return currentArmyElement;
	}

	public void setCurrentArmyElement(ArmyElement currentArmyElement) {
		this.currentArmyElement = currentArmyElement;
	}

	public DamageGrid getCurrentGrid() {
		return currentGrid;
	}

	public void setCurrentGrid(DamageGrid currentGrid) {
		this.currentGrid = currentGrid;
	}

	public MultiPVModel getCurrentModel() {
		return currentModel;
	}
	
	public void setCurrentModel(MultiPVModel model) {
		currentModel = model;
	}

	public ChronoData getPlayer1Chrono() {
		return player1Chrono;
	}

	public void setPlayer1Chrono(ChronoData player1Chrono) {
		this.player1Chrono = player1Chrono;
	}

	public ChronoData getPlayer2Chrono() {
		return player2Chrono;
	}

	public void setPlayer2Chrono(ChronoData player2Chrono) {
		this.player2Chrono = player2Chrono;
	}

	public ArmyStore getArmy(int nbPlayer) {
		if (nbPlayer == PLAYER1) {
			return player1Army;
		} else {
			return player2Army;
		}
	}
		
	public void setArmy(ArmyStore army, int playerNumber) {
		if (playerNumber == PLAYER1) {
			player1Army = army;
		} else {
			player2Army = army;
		}
	}

	/**
	 * indicates that current battle has 2 players
	 * @return
	 */
	public boolean hasPlayer2() {
		if (player2entries != null && ! player2entries.isEmpty()) {
			return true;
		}
		return false;
	}

	public boolean isFullScreenChrono() {
		return fullScreenChrono;
	}

	public void setFullScreenChrono(boolean fullScreenChrono) {
		this.fullScreenChrono = fullScreenChrono;
	}

	public void stopChronos() {
		player1Chrono.pause(SystemClock.elapsedRealtime());
		player2Chrono.pause(SystemClock.elapsedRealtime());
		
	}

	public void startLoadingArmy2() {
		loadingArmy2 = true;
	}
	
	public void addArmy2Entry(BattleEntry entry) {
		if (loadingArmy2) {
			player2loadingEntries.add(entry);	
		} else {
			Log.w(TAG, "trying to add an entry to army out of sync");
		}
		
	}
	
	public void finishLoadingArmy2() {
		loadingArmy2 = false;
		
		for (BattleEntry entry : player2loadingEntries) {
			ArmyElement element = ArmySingleton.getInstance().getArmyElement(entry.getId());
			entry.setReference(element);
		}
		
		player2entries = player2loadingEntries;
	}
	

	
}
