package com.schlaf.steam.activities.battle;

import java.lang.ref.WeakReference;

import android.os.Handler;
import android.os.Message;
import android.util.Log;

import com.schlaf.steam.bluetooth.BlueToothConstants;

public class BattleActivityHandler extends Handler {

	private WeakReference<BattleActivity> ref;
	
	private boolean D = true;
	private String TAG = "BattleActivityHandler";
	
    public BattleActivityHandler(BattleActivity battleActivity) {
    	ref = new WeakReference<BattleActivity>(battleActivity);
	}

	@Override
    public void handleMessage(Message msg) {
        switch (msg.what) {
        case BlueToothConstants.BT_OFF:
        	ref.get().blueToothOff();
        	break;
        case BlueToothConstants.BT_ON:
        	ref.get().blueToothOn();
        	break;
        case BlueToothConstants.DISCOVERY_FINISHED:
        	ref.get().updateDevicesAvailable();
        	break;
        case BlueToothConstants.MESSAGE_WRITE:
        	BattleCommunicationObject outputObj = (BattleCommunicationObject) msg.obj;
        	if (D) Log.d(TAG, "written" + outputObj.toString());
            break;
        case BlueToothConstants.MESSAGE_READ:
        	BattleCommunicationObject inputObj = (BattleCommunicationObject) msg.obj;
        	if (D) Log.d(TAG, "received" + inputObj.toString());
        	
            switch (inputObj.getAction()) {
            case START_ARMY_LIST:
            	ref.get().receivingArmy();
            	break;
            case ADD_ENTRY: 
            	BattleSingleton.getInstance().addArmy2Entry(inputObj.getBattleEntry());
            	break;
            case END_ARMY_LIST:
            	ref.get().receivedArmy();
        		// updateTitleAndSaveBattle(selectedArmy.getFileName());
            	
            	break;
            case MODIFY_DAMAGE_GRID:
            	
            	ref.get().handleIncomingDamageFromBT(inputObj.getDamageGrid());
            	break;
            }
            break;
//        case BlueToothConstants.MESSAGE_DEVICE_NAME:
//            // save the connected device's name
//            Toast.makeText(ref.get().getApplicationContext(), "Connected to device", Toast.LENGTH_SHORT).show();
//            ref.get().sendArmyListTroughBlueTooth();
//            break;
        }
    }
	
}
