package com.schlaf.steam.bluetooth;

import com.schlaf.steam.activities.battle.BattleCommunicationObject;

public interface MessageObserver {

	public void receiveMessage(BattleCommunicationObject msg);
}
