/**
 * 
 */
package com.schlaf.steam;

import android.app.Application;

/**
 * @author S0085289
 * classe de base de l'application.
 */
public class SteamPunkRosterApplication extends Application {

	public SteamPunkRosterApplication() {
		super();
	}
	
	/** player name, useful for sharing data on the internet */
	private String playerName;

	

	public String getPlayerName() {
		return playerName;
	}

	public void setPlayerName(String playerName) {
		this.playerName = playerName;
	}

	
	
}
