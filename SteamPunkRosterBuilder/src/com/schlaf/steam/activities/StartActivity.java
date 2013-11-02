package com.schlaf.steam.activities;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.net.URL;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Resources;
import android.net.Uri;
import android.os.Bundle;
import android.os.Environment;
import android.support.v4.app.DialogFragment;
import android.text.Html;
import android.text.method.LinkMovementMethod;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.webkit.WebView;
import android.widget.TextView;
import android.widget.Toast;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.actionbarsherlock.view.Menu;
import com.actionbarsherlock.view.MenuItem;
import com.schlaf.steam.R;
import com.schlaf.steam.SteamPunkRosterApplication;
import com.schlaf.steam.activities.ChooseArmyListDialog.ChooseArmyListener;
import com.schlaf.steam.activities.ChooseFactionDialog.ChangeFactionListener;
import com.schlaf.steam.activities.battle.BattleActivity;
import com.schlaf.steam.activities.battleresult.BattleResultsActivity;
import com.schlaf.steam.activities.battleselection.BattleSelector;
import com.schlaf.steam.activities.card.CardLibraryActivity;
import com.schlaf.steam.activities.card.ViewCardActivity;
import com.schlaf.steam.activities.chrono.ChronoActivity;
import com.schlaf.steam.activities.importation.ImportSelector;
import com.schlaf.steam.activities.managelists.ManageArmyListsActivity;
import com.schlaf.steam.activities.preferences.PreferenceActivity;
import com.schlaf.steam.activities.selectlist.PopulateArmyListActivity;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Faction;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.storage.ArmyListDescriptor;
import com.schlaf.steam.storage.StorageManager;
import com.schlaf.steam.util.IabHelper;
import com.schlaf.steam.xml.ContractExtractor;
import com.schlaf.steam.xml.TierExtractor;
import com.schlaf.steam.xml.XmlExtractor;

public class StartActivity extends SherlockFragmentActivity implements ChangeFactionListener, ChooseArmyListener {
	
	IabHelper mHelper;
	
	private static final String TAG = "StartActivity";
	
    /** Called when the activity is first created. */
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main);
    
        Resources res = getResources();
        if (! ArmySingleton.getInstance().isFullyLoaded()) {

	        XmlExtractor extractor = new XmlExtractor(res, (SteamPunkRosterApplication) getApplication());
	        extractor.doExtract();
        
	        extractor.extractImportedArmies(this, false);
	        
            TierExtractor tiersExtractor = new TierExtractor(res, (SteamPunkRosterApplication) getApplication());
            tiersExtractor.doExtract();
            
            ContractExtractor contractExtractor = new ContractExtractor(res, (SteamPunkRosterApplication) getApplication());
            contractExtractor.doExtract();
        }
        

        // create WHAC dir
		File externalStorageDir = Environment.getExternalStorageDirectory ();
		String whacExternalDirPath = externalStorageDir.getPath() + StorageManager.WHAC_SUBDIR;
		File whacExternalDir = new File(whacExternalDirPath);
		
		if (! whacExternalDir.exists() ) {
			boolean succeed = whacExternalDir.mkdirs();
			if (!succeed) {
				Log.w(TAG, "failed to create Whac subdir in SD card");
			}
		}

	
		
		Intent intent = getIntent();
		// String factionId = intent.getStringExtra(android.intent.action.VIEW);

		final String action = intent.getAction();
        if (Intent.ACTION_VIEW.equals(action) || Intent.ACTION_EDIT.equals(action)) {
        	final Uri mUri = intent.getData();
        	Log.d(TAG, mUri.toString());
        	
        	
        	AlertDialog.Builder alert = new AlertDialog.Builder(this);
    		alert.setTitle("You are about to import a WHAC data file");
    		alert.setMessage("Really import data ?");
    		alert.setIcon(R.drawable.import_content);
			alert.setPositiveButton("Ok",
					new DialogInterface.OnClickListener() {
						public void onClick(DialogInterface dialog,
								int whichButton) {

							URL url;
							StringBuffer sb = new StringBuffer();
							try {
								url = new URL(mUri.getScheme(), mUri.getHost(),
										mUri.getPath());
								InputStream is = url.openStream();

								byte[] buffer = new byte[1024];
								int length;
								// copy the file content in bytes
								while ((length = is.read(buffer)) > 0) {
									String st = new String(buffer, 0, length, "UTF-8");
									sb.append(st);
								}
								
								is.close();

								// import
								Resources res = getResources();
								XmlExtractor extractor = new XmlExtractor(
										res,
										(SteamPunkRosterApplication) getApplication());
								if ( extractor.extractImportedFileFromInternet(getApplication(), sb)) {
									Toast.makeText(getApplicationContext(), "import successfull", Toast.LENGTH_SHORT).show();
									
									// if successfull, copy
									String fileName = mUri.getLastPathSegment(); // getPath();
									StorageManager.importDataFileFromContentBuffer(getApplicationContext(), fileName, sb);
									
								} else {
									Toast.makeText(getApplicationContext(), "import failed - make sure the source file is correct", Toast.LENGTH_SHORT).show();
								}

								

								//Log.d(TAG, sb.toString());
							} catch (Exception e) {
								e.printStackTrace();
							}

						}
    		});

    		alert.setNegativeButton("Cancel",
    				new DialogInterface.OnClickListener() {
    					public void onClick(DialogInterface dialog, int whichButton) {
    						// Canceled.
    						Toast.makeText(getApplicationContext(),
    								"Import cancelled", Toast.LENGTH_SHORT).show();
    					}
    				});

    		alert.show();
        	
        	
//        	File source = new File(mUri.get);
//        	FileInputStream fis = new FileInputStream(source);
//			
//        	byte[] buffer = new byte[1024];
//
//			int length;
//			StringBuffer sb = new StringBuffer();
//			// copy the file content in bytes
//			while ((length = fis.read(buffer)) > 0) {
//				sb.append(buffer);
//			}
//			Log.d(TAG, sb.toString());
        }
		
		
		
		
		
		
		
		
		
		String base64EncodedPublicKey = "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmmvhRuXbIzTIK2Ilx51w79YuH4fRYTBpe20E3HjBTMZ/IxHi6uF2GzSrW/EPE2Q9cPnDI0hG+5mwmZbF5lUH2IxXgc0hUHO2Qx89Ju0KhtHKsBdyDkVmefG3h2wAJUjtjXm7MVnuCxlk5Hwvr3ewWKih1BjHWHZYH3DqU4+J5J5lRoxVHkZp7ZX8k3Qzn2Pkq7pEjwfkagC9R7GcjL1EnFsBaIz2nkPu0zGOXAX0tMLVyl/BGgzNlhoV3uQGJ1x/0wlXluqxUMEHz6s3ddMhhLpWI/80U5KmIjHJyUSc+/B8Obp99th0wrEMC51znISXYpYpRhMuXbv2Pwadyg5LGwIDAQAB";
		// compute your public key and store it in base64EncodedPublicKey
		mHelper = new IabHelper(this, base64EncodedPublicKey);
		
		

        
    }

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getSupportMenuInflater().inflate(R.menu.startup_menu, menu);
        return true;
    }    
    
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
	    switch (item.getItemId()) {
	        case R.id.menu_battle:  
	        	String battleName = StorageManager.getLastViewedArmyList(getApplicationContext());
	        	if ("".equals(battleName) || ! StorageManager.isExistingBattle(getApplicationContext(), battleName)) {
	        		Toast.makeText(getApplicationContext(), "no previous battle", Toast.LENGTH_SHORT).show();
	        		return true;
	        	} 
				Intent intentBattle = new Intent(this, BattleActivity.class);
				intentBattle.putExtra(BattleActivity.INTENT_ARMY, battleName);
				intentBattle.putExtra(BattleActivity.INTENT_CREATE_BATTLE_FROM_ARMY, false);
				startActivity(intentBattle);
	            return true;
	        case R.id.menu_army_list:
	        	
	        	String army_name = StorageManager.getLastViewedArmyList(getApplicationContext());
	        	if ("".equals(army_name) || ! StorageManager.existsArmyList(getApplicationContext(), army_name)) {
	        		Toast.makeText(getApplicationContext(), "no previous army", Toast.LENGTH_SHORT).show();
	        		return true;
	        	} 
				StorageManager.loadArmyList(getApplicationContext(), army_name, SelectionModelSingleton.getInstance());

				FactionNamesEnum faction = SelectionModelSingleton.getInstance().getFaction();
				Intent intentArmy = new Intent(this, PopulateArmyListActivity.class);
				intentArmy.putExtra(PopulateArmyListActivity.INTENT_FACTION, faction.getId());
				intentArmy.putExtra(PopulateArmyListActivity.INTENT_START_NEW_ARMY, false);
				startActivity(intentArmy);

	            return true;
	        case R.id.menu_prefs:
	    		Intent intent = new Intent(this, PreferenceActivity.class);
	    		startActivity(intent);
	        	return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}	    
    
    public void startArmy(View view) {

    	DialogFragment dialog = new ChooseFactionDialog();
		dialog.show(getSupportFragmentManager(), "ChooseFactionActivity");
    	
//        Intent intent = new Intent(this, ChooseFactionActivity.class);
//        startActivity(intent);
    }

    public void startBattle(View view) {
//        Intent intent = new Intent(this, ChooseArmyListDialog.class);
//        startActivityForResult(intent, BattleActivity.CHOOSE_ARMY_LIST_DIALOG);

        Intent intent = new Intent(this, BattleSelector.class);
        startActivity(intent);

    }
    
    public void cardLibrary(View view) {
      Intent intent = new Intent(this, CardLibraryActivity.class);
      startActivity(intent);

  }
    
    public void viewCard(View view) {
        Intent intent = new Intent(this, ViewCardActivity.class);
        startActivity(intent);
    }


	public void loadArmy(View v) {
		
		DialogFragment dialog = new ChooseArmyListDialog();
		dialog.show(getSupportFragmentManager(), "ChooseArmyListDialog");
		
//		Intent intent = new Intent(this, ChooseArmyListDialog.class);
//		startActivityForResult(intent, ChooseArmyListDialog.CHOOSE_ARMY_LIST_DIALOG);
		
	}

	public void editArmy(View v) {
		Intent intent = new Intent(this, ManageArmyListsActivity.class);
		startActivityForResult(intent, ManageArmyListsActivity.CHOOSE_ARMY_LIST_DIALOG);
		
	}

	public void chrono(View v) {
		Intent intent = new Intent(this, ChronoActivity.class);
		startActivity(intent);
	}
	
	public void preferences(View v) {
		Intent intent = new Intent(this, PreferenceActivity.class);
		startActivity(intent);
	}
	
	public void battleResults(View v) {
		Intent intent = new Intent(this, BattleResultsActivity.class);
		startActivity(intent);
	}	
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		if (requestCode == BattleActivity.CHOOSE_ARMY_LIST_DIALOG) {
			if (resultCode == RESULT_OK) {
				String army_name = data.getStringExtra(BattleActivity.INTENT_ARMY);
				Toast.makeText(this, "Battle selected : " + army_name, Toast.LENGTH_SHORT)
		          .show();
				
				// SelectionModelSingleton.getInstance().loadStatus(getApplicationContext(), army_name);
				
				// open battle activity
				Intent intent = new Intent(this, BattleActivity.class);
				intent.putExtra(BattleActivity.INTENT_ARMY, army_name);
				intent.putExtra(BattleActivity.INTENT_CREATE_BATTLE_FROM_ARMY, true);
				startActivity(intent);
				
			}
		}
	}	

	
	@Override
	public void onBackPressed() {
		AlertDialog.Builder alert = new AlertDialog.Builder(this);
		alert.setTitle("You are about to exit the application");
		alert.setMessage("Exit anyway?");

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
			public void onClick(DialogInterface dialog, int whichButton) {
				StartActivity.this.finish();
			}
		});

		alert.setNegativeButton("Cancel",
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int whichButton) {
						// Canceled.
						Toast.makeText(getApplicationContext(),
								"Exit cancelled", Toast.LENGTH_SHORT).show();
					}
				});

		alert.show();
	}

	@Override
	public void onChangeFaction(Faction newFaction) {
		Intent intent = new Intent(this, PopulateArmyListActivity.class);
		intent.putExtra(PopulateArmyListActivity.INTENT_FACTION, newFaction.getId());
		intent.putExtra(PopulateArmyListActivity.INTENT_START_NEW_ARMY, true);
		startActivity(intent);
	}

	@Override
	public void onArmyListSelected(ArmyListDescriptor army) {
		String army_name = army.getFileName();
		Toast.makeText(this, "army selected " + army_name, Toast.LENGTH_SHORT)
				.show();

		StorageManager.loadArmyList(getApplicationContext(), army_name,
				SelectionModelSingleton.getInstance());

		// open populate list activity
		FactionNamesEnum faction = SelectionModelSingleton.getInstance()
				.getFaction();
		Intent intent = new Intent(this, PopulateArmyListActivity.class);
		intent.putExtra(PopulateArmyListActivity.INTENT_FACTION,
				faction.getId());
		intent.putExtra(PopulateArmyListActivity.INTENT_START_NEW_ARMY, false);
		startActivity(intent);
	}

	@Override
	public void onArmyListDeleted(ArmyListDescriptor army) {
		if ( StorageManager.deleteArmyList(getApplicationContext(), army.getFileName())) {
			ChooseArmyListDialog chooseArmyDialog = (ChooseArmyListDialog) getSupportFragmentManager().findFragmentByTag("ChooseArmyListDialog");
			chooseArmyDialog.notifyArmyListDeletion(army);
		} else {
			Toast.makeText(getApplicationContext(),
					"Army deletion failed", Toast.LENGTH_SHORT).show();
		}
		
		
	}
	
	public void importDataFile(View v) {
		
	       Intent intent = new Intent(this, ImportSelector.class);
	        startActivity(intent);

	}
	
	public void version(View v) {
		
		LayoutInflater inflater = getLayoutInflater();
    	AlertDialog.Builder alert = new AlertDialog.Builder(this);
    	String currentVersion = getResources().getString(R.string.currentVersion);
		alert.setTitle("WHAC version " + currentVersion);
		
		View versionView = inflater.inflate(R.layout.version_layout, null);
		
		TextView tv = (TextView) versionView.findViewById(R.id.tvSite);
	    tv.setText(Html.fromHtml("<a href=http://whac.forumactif.org/> WHAC Official forum "));
	    tv.setMovementMethod(LinkMovementMethod.getInstance());
		
	    WebView wvChanges= (WebView) versionView.findViewById(R.id.wvChanges);
	    
	    try {
            InputStream fin = getAssets().open("version.html");
                byte[] buffer = new byte[fin.available()];
                fin.read(buffer);
                fin.close();
                wvChanges.loadData(new String(buffer), "text/html", "UTF-8");
        } catch (IOException e) {
            e.printStackTrace();
        }
	    
	    // wvChanges.loadData(getResources().getString(R.string.currentChanges), "text/html", "UTF-8");
	    
		alert.setView(versionView);
		alert.show();

	}
	

	@Override
	public void onDestroy() {
	   super.onDestroy();
	   if (mHelper != null) mHelper.dispose();
	   mHelper = null;
	}	
	
}