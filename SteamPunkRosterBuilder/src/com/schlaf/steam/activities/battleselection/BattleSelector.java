package com.schlaf.steam.activities.battleselection;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.os.Bundle;
import android.util.Log;
import android.widget.TabHost;
import android.widget.Toast;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.ChooseArmyListDialog;
import com.schlaf.steam.activities.ChooseArmyListDialog.ChooseArmyListener;
import com.schlaf.steam.activities.battle.BattleActivity;
import com.schlaf.steam.activities.managelists.EditArmyListActivity;
import com.schlaf.steam.storage.ArmyListDescriptor;
import com.schlaf.steam.storage.BattleListDescriptor;
import com.schlaf.steam.storage.StorageManager;

public class BattleSelector extends SherlockFragmentActivity implements ChooseArmyListener {

    TabHost tHost;
    
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.battle_selector);
 
        
        getSupportActionBar().setTitle("Start/Resume battle");
        
        tHost = (TabHost) findViewById(android.R.id.tabhost);
        tHost.setup();
 
        /** Defining Tab Change Listener event. This is invoked when tab is changed */
        TabHost.OnTabChangeListener tabChangeListener = new TabHost.OnTabChangeListener() {
 
            @Override
            public void onTabChanged(String tabId) {
                android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                ExistingBattlesFragment battlesFragment = (ExistingBattlesFragment) fm.findFragmentByTag("battles");
                ExistingArmiesFragment armiesFragment = (ExistingArmiesFragment) fm.findFragmentByTag("armies");
                android.support.v4.app.FragmentTransaction ft = fm.beginTransaction();
 
                /** Detaches the battle fragment if exists */
                if(battlesFragment!=null)
                    ft.detach(battlesFragment);
 
                /** Detaches the armies fragment if exists */
                if(armiesFragment!=null)
                    ft.detach(armiesFragment);
 
                /** If current tab is battles */
                if(tabId.equalsIgnoreCase("battle_lists")){
 
                    if(battlesFragment==null){
                        /** Create AndroidFragment and adding to fragmenttransaction */
                        ft.add(R.id.realtabcontent,new ExistingBattlesFragment(), "battles");
                    }else{
                        /** Bring to the front, if already exists in the fragmenttransaction */
                        ft.attach(battlesFragment);
                        battlesFragment.refresh();
                    }
 
                }else{    /** If current tab is armies */
                    if(armiesFragment==null){
                        /** Create AppleFragment and adding to fragmenttransaction */
                        ft.add(R.id.realtabcontent,new ExistingArmiesFragment(), "armies");
                     }else{
                        /** Bring to the front, if already exists in the fragmenttransaction */
                        ft.attach(armiesFragment);
                    }
                }
                ft.commit();
            }
        };
 
        /** Setting tabchangelistener for the tab */
        tHost.setOnTabChangedListener(tabChangeListener);
 
        /** Defining tab builder for armies tab */
        TabHost.TabSpec tSpecAndroid = tHost.newTabSpec("army_lists");
        tSpecAndroid.setIndicator("Create battle from ...",getResources().getDrawable(R.drawable.edit_list_icon));
        tSpecAndroid.setContent(new BattleTab(getBaseContext()));
        tHost.addTab(tSpecAndroid);
 
        /** Defining tab builder for battles tab */
        TabHost.TabSpec tSpecApple = tHost.newTabSpec("battle_lists");
        tSpecApple.setIndicator("Resume battle",getResources().getDrawable(R.drawable.battle_icon));
        tSpecApple.setContent(new BattleTab(getBaseContext()));
        tHost.addTab(tSpecApple);
 
    }
    
    public void deleteExistingBattle(final BattleListDescriptor battle) {
    	Log.d("BattleSelector","deleteExistingBattle " + battle.getFilename());
    	
    	
    	// 1. Instantiate an AlertDialog.Builder with its constructor
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);

    	// 2. Chain together various setter methods to set the dialog characteristics
    	builder.setMessage("you are about to delete the battle : " + battle.getFilename());
    	builder.setTitle("delete battle?");

    	
    	builder.setPositiveButton(R.string.delete, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User clicked OK button
            	if (StorageManager.deleteBattle(getApplicationContext(), battle.getFilename())) {
                	// notify fragment...
                	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                	ExistingBattlesFragment battlesFragment = (ExistingBattlesFragment) fm.findFragmentByTag("battles");
                	battlesFragment.notifyBattleListDeletion(battle);
            	} else {
            		Toast.makeText(getApplicationContext(), "deletion failed", Toast.LENGTH_SHORT).show();
            	}
            }
        });
    	builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User cancelled the dialog
            }
        });

    	
    	// 3. Get the AlertDialog from create()
    	AlertDialog dialog = builder.create();
    	
    	dialog.show();
    }

	@Override
	public void onArmyListSelected(ArmyListDescriptor army) {
		
		Toast.makeText(getApplicationContext(), "Creating battle from army list..." , Toast.LENGTH_SHORT).show();
		
		// open battle activity
		Intent intent = new Intent(getApplicationContext(), BattleActivity.class);
		intent.putExtra(BattleActivity.INTENT_ARMY, army.getFileName());
		intent.putExtra(BattleActivity.INTENT_CREATE_BATTLE_FROM_ARMY, true);
		startActivity(intent);

	}

	@Override
	public void onArmyListDeleted(final ArmyListDescriptor army) {
    	Log.d("BattleSelector","deleteExistingBattle " + army.getFileName());
    	
    	
    	// 1. Instantiate an AlertDialog.Builder with its constructor
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);

    	// 2. Chain together various setter methods to set the dialog characteristics
    	builder.setMessage("you are about to delete the army list : " + army.getFileName());
    	builder.setTitle("delete list?");
    	
    	builder.setPositiveButton(R.string.delete, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User clicked OK button
            	if (StorageManager.deleteArmyList(getApplicationContext(), army.getFileName())) {
                	// notify fragment...
                	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                	ExistingArmiesFragment armiesFragment = (ExistingArmiesFragment) fm.findFragmentByTag("armies");
                	armiesFragment.notifyArmyListDeletion(army);
            	} else {
            		Toast.makeText(getApplicationContext(), "deletion failed", Toast.LENGTH_SHORT).show();
            	}
            	
            }
        });
    	builder.setNegativeButton(R.string.cancel, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
                // User cancelled the dialog
            }
        });
    	
    	// 3. Get the AlertDialog from create()
    	AlertDialog dialog = builder.create();
    	
    	dialog.show();
	}
}
