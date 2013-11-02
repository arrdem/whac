/**
 * 
 */
package com.schlaf.steam.activities.battle;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import android.app.AlertDialog;
import android.bluetooth.BluetoothAdapter;
import android.content.ComponentName;
import android.content.Context;
import android.content.DialogInterface;
import android.content.DialogInterface.OnCancelListener;
import android.content.Intent;
import android.content.ServiceConnection;
import android.os.Bundle;
import android.os.Handler;
import android.os.IBinder;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.FrameLayout;
import android.widget.ImageButton;
import android.widget.LinearLayout;
import android.widget.LinearLayout.LayoutParams;
import android.widget.Toast;
import android.widget.ViewSwitcher;

import com.actionbarsherlock.app.ActionBar;
import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.actionbarsherlock.view.Menu;
import com.actionbarsherlock.view.MenuItem;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.ChooseArmyListDialog;
import com.schlaf.steam.activities.ChooseArmyListDialog.ChooseArmyListener;
import com.schlaf.steam.activities.battle.BattleListFragment.BattleListInterface;
import com.schlaf.steam.activities.battle.ChooseBluetoothListDialog.ChooseBlueToothDeviceListener;
import com.schlaf.steam.activities.battle.EndBattleDialog.EndBattleListener;
import com.schlaf.steam.activities.card.ChooseCardFromLibraryDialog;
import com.schlaf.steam.activities.card.ViewCardActivity;
import com.schlaf.steam.activities.card.ViewCardFragment;
import com.schlaf.steam.activities.card.ViewCardFragment.ViewCardActivityInterface;
import com.schlaf.steam.activities.chrono.ChronoConfigDialog;
import com.schlaf.steam.activities.chrono.ChronoFragment;
import com.schlaf.steam.activities.chrono.ChronoFragment.ChronoActivityInterface;
import com.schlaf.steam.activities.damages.ColossalGridDamageFragment;
import com.schlaf.steam.activities.damages.DamageListener;
import com.schlaf.steam.activities.damages.ModelDamageLine;
import com.schlaf.steam.activities.damages.MultiPVUnitDamageFragment;
import com.schlaf.steam.activities.damages.MyrmidonGridDamageFragment;
import com.schlaf.steam.activities.damages.SingleLineDamageFragment;
import com.schlaf.steam.activities.damages.WarbeastSpiralDamageFragment;
import com.schlaf.steam.activities.damages.WarjackGridDamageFragment;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.bluetooth.DeviceVO;
import com.schlaf.steam.bluetooth.MyBeddernetService;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.ColossalDamageGrid;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.MultiPVUnitGrid;
import com.schlaf.steam.data.MyrmidonDamageGrid;
import com.schlaf.steam.data.WarbeastDamageSpiral;
import com.schlaf.steam.data.WarjackLikeDamageGrid;
import com.schlaf.steam.storage.ArmyListDescriptor;
import com.schlaf.steam.storage.StorageManager;

/**
 * @author S0085289
 *
 */
public class BattleActivity extends SherlockFragmentActivity implements BattleListInterface, ViewCardActivityInterface, DamageListener, ChronoActivityInterface, ChooseArmyListener, EndBattleListener, ChooseBlueToothDeviceListener {

	private final static String TAG ="BattleActivity";
	private static boolean D = true;
	
	public static final int CHOOSE_ARMY_LIST_DIALOG = 987;
	public static final String INTENT_ARMY = "army_file";
	public static final String INTENT_CREATE_BATTLE_FROM_ARMY = "start";
	public static final String INTENT_CONTINUE_BATTLE = "continue";
	
	
	private String armyName;
	
	private boolean FAKE_BT = false;
	
 	@Override
	protected void onCreate(Bundle savedInstanceState) {
		Log.d("BattleActivity", "onCreate");
		super.onCreate(savedInstanceState);
		
		final String armyFileName = getIntent().getStringExtra(INTENT_ARMY);
		boolean createBattleFromArmyList = getIntent().getBooleanExtra(INTENT_CREATE_BATTLE_FROM_ARMY, false);
		
		
		
		armyName = armyFileName;
		
		if (createBattleFromArmyList) {
			if (! StorageManager.isExistingBattle(getApplicationContext(), armyFileName) ) {
				StorageManager.createBattleFromArmy(getApplicationContext(), armyFileName, BattleSingleton.getInstance(), BattleSingleton.PLAYER1);
				
				// clean player2 list
				BattleSingleton.getInstance().setArmy(null, BattleSingleton.PLAYER2);
				BattleSingleton.getInstance().getEntries(BattleSingleton.PLAYER2).clear();
				
			} else {
				// default : load existing battle...
				StorageManager.loadExistingBattle(getApplicationContext(), armyFileName, BattleSingleton.getInstance());
				
				// ask if force re-creation of battle.
				AlertDialog.Builder alert = new AlertDialog.Builder(this);

				alert.setTitle("A battle already exists for this army list");
				alert.setMessage("Do you want to re-create a battle from new, or use the existing one");

				alert.setPositiveButton("Erase and re-create", new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int whichButton) {
						BattleActivity.this.recreateBattleFromScratch();
					}
				});

				alert.setNegativeButton("Reuse", new DialogInterface.OnClickListener() {
				  public void onClick(DialogInterface dialog, int whichButton) {
					  // do nothing, already reused by default;
				  }
				});

				alert.setOnCancelListener(new OnCancelListener() {
					@Override
					public void onCancel(DialogInterface dialog) {
						  // do nothing, already reused by default;
					}
				});
				
				alert.show();				
			}
		} else {
			// load existing battle from previous screen
			// OR (!!!!)
			// reload battle after screen rotation!
			if (getIntent().getBooleanExtra(INTENT_CONTINUE_BATTLE, false)) {
				Log.d("BattleActivity", "onCreate - continue battle");
				// do nothing
			} else {
				// load
				Log.d("BattleActivity", "onCreate - load battle");
				StorageManager.loadExistingBattle(getApplicationContext(), armyFileName, BattleSingleton.getInstance());
			}
			
		}
		
		if (! getIntent().getBooleanExtra(INTENT_CONTINUE_BATTLE, false)) {
			StorageManager.updateLastBattle(getApplicationContext(), armyFileName);	
		}
		
		getSupportActionBar().setLogo(R.drawable.battle_icon);
		getSupportActionBar().setTitle(armyName);
		
		// prevents reloading when activity recreated (screen orientation change)
		getIntent().removeExtra(INTENT_CREATE_BATTLE_FROM_ARMY);
		
		// from now, we pursue on same battle
		getIntent().putExtra(INTENT_CONTINUE_BATTLE, true);
		
		setContentView(R.layout.battlelayout_fragmented);
		
		// real display is in fragment...
		BattleListFragment player1Fragment = new BattleListFragmentPlayer1();
		FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
		ft.replace(R.id.fragment_player1_placeholder, player1Fragment, BattleListFragmentPlayer1.ID);
		
		if (BattleSingleton.getInstance().hasPlayer2()) {
	    	BattleListFragment player2Fragment = new BattleListFragmentPlayer2();
			ft.replace(R.id.fragment_player2_placeholder, player2Fragment, BattleListFragmentPlayer2.ID);
		} else {
			// delete fragment?
			FragmentManager fragmentManager = getSupportFragmentManager();
			if (fragmentManager.findFragmentByTag(BattleListFragmentPlayer2.ID) != null) {
				ft.remove(fragmentManager.findFragmentByTag(BattleListFragmentPlayer2.ID));
			}
		}

		ft.commit();
		
		
		updateTwoPlayerLayout();
		updateChronoLayout();
		
		// createBlueToothServer();
		
	}
	
	protected void recreateBattleFromScratch() {
		Log.d("BattleActivity", "recreateBattleFromScratch");
		StorageManager.createBattleFromArmy(getApplicationContext(), armyName, BattleSingleton.getInstance(), BattleSingleton.PLAYER1);
		
		BattleSingleton.getInstance().setArmy(null, BattleSingleton.PLAYER2);
		BattleSingleton.getInstance().getEntries(BattleSingleton.PLAYER2).clear();
		
		// notify fragments
		FragmentManager fragmentManager = getSupportFragmentManager();

		if (fragmentManager.findFragmentByTag(BattleListFragmentPlayer1.ID) != null) {
			BattleListFragment listFragment = (BattleListFragment) fragmentManager.findFragmentByTag(BattleListFragmentPlayer1.ID);
			Log.d("BattleActivity", "listFragment.refreshAllList");
			listFragment.refreshAllList();
		}

		if (fragmentManager.findFragmentByTag(ChronoFragment.ID) != null) {
			((ChronoFragment) fragmentManager.findFragmentByTag(ChronoFragment.ID)).updateDisplay();
		}

		updateTwoPlayerLayout();
	}

	public BattleSingleton getCurrentArmy() {
		return null;
	}
	
	public BattleEntry getCurrentEntry() {
		return BattleSingleton.getInstance().getCurrentEntry();
	}

	@Override
	public BattleList getArmyList() {
		return null;
	}
	
	
	@Override
	public void viewBattleEntryDetail(BattleEntry model) {
		Log.d("BattleActivity", "viewModelDetail");
		SelectionModelSingleton.getInstance().setCurrentlyViewedElement(
				ArmySingleton.getInstance().getArmyElements()
						.get(model.getId()));
		
		viewModelDetail(null);

	}

	@Override
	public ArmyElement getArmyElement() {
		return SelectionModelSingleton.getInstance().getCurrentlyViewedElement();
	}

	public void removeViewCardFragment(View v) {
		Log.d("BattleActivity","removeViewCardFragment");
		FragmentManager fragmentManager = getSupportFragmentManager();
		FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
		
		if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
			fragmentTransaction.remove(fragmentManager.findFragmentByTag(ViewCardFragment.ID));
		}
		fragmentTransaction.commit();
		
		FrameLayout cardZone = (FrameLayout) findViewById(R.id.card_zone);
		cardZone.setVisibility(View.GONE);
		
		if ( findViewById(R.id.chrono_zone) != null) {
			findViewById(R.id.chrono_zone).setVisibility(View.VISIBLE);
		}
	}

	@Override
	public boolean isCardfullScreen() {
		return false;	
	}

	@Override
	public boolean isCardDoublePane() {
		return false;
	}

	@Override
	public void showDamageDialog(MultiPVModel model) {
		DamageGrid grid = model.getDamageGrid();
		Log.d("BattleActivity", "showDamageDialog");
		
		BattleSingleton.getInstance().setCurrentGrid(grid);
		BattleSingleton.getInstance().setCurrentModel(model);
		
		if (grid instanceof ModelDamageLine ) {
			DialogFragment dialog = new SingleLineDamageFragment();
			dialog.show(getSupportFragmentManager(), "SingleLineDamageFragment");
		} else if (grid instanceof  WarjackLikeDamageGrid) {
			if (grid instanceof ColossalDamageGrid) {
				DialogFragment dialog = new ColossalGridDamageFragment();
				dialog.show(getSupportFragmentManager(), "ColossalDamageFragment");
			} else if (grid instanceof MyrmidonDamageGrid) {
				DialogFragment dialog = new MyrmidonGridDamageFragment();
				dialog.show(getSupportFragmentManager(), "MyrmidonGridDamageFragment");
			} else {
				DialogFragment dialog = new WarjackGridDamageFragment();
				dialog.show(getSupportFragmentManager(), "WarjackGridDamageFragment");
			}
		} else if (grid instanceof WarbeastDamageSpiral) {
			DialogFragment dialog = new WarbeastSpiralDamageFragment();
			dialog.show(getSupportFragmentManager(), "WarbeastDamageFragment");
		} else if (grid instanceof MultiPVUnitGrid) {
			DialogFragment dialog = new MultiPVUnitDamageFragment();
			dialog.show(getSupportFragmentManager(), "GridDamageFragment");
		}
	}

	public MultiPVModel getCurrentModel() {
		return BattleSingleton.getInstance().getCurrentModel();
	}
	
	@Override
	public DamageGrid getCurrentDamageGrid() {
		return BattleSingleton.getInstance().getCurrentGrid();
	}

	@Override
	public void onBackPressed() {
		
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		if (viewSwitcher != null) {
			// small screen, chrono fullscreen, just reduce chrono
			if (BattleSingleton.getInstance().isFullScreenChrono()) {
				shrinkChrono(null);
				return;
			}
		}
		
		// if card visible, mask...
		FragmentManager fragmentManager = getSupportFragmentManager();

		if (findViewById(R.id.card_zone) != null) {
			if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
				removeViewCardFragment(null);
				return;
			}
		}	
		
		
		
		AlertDialog.Builder alert = new AlertDialog.Builder(this);

		alert.setTitle("Exit current battle");
		alert.setMessage("The current battle status will be saved. Exit anyway?");

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
		public void onClick(DialogInterface dialog, int whichButton) {
			
			// stop chrono
			BattleSingleton.getInstance().stopChronos();
			
			StorageManager.saveBattle(getApplicationContext(), armyName, BattleSingleton.getInstance());
			Toast.makeText(getApplicationContext(), "Battle saved, exiting", Toast.LENGTH_SHORT).show();
			BattleActivity.this.finish();
		}
		});

		alert.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
		  public void onClick(DialogInterface dialog, int whichButton) {
		    // Canceled.
			Toast.makeText(getApplicationContext(), "Exit cancelled", Toast.LENGTH_SHORT).show();
		  }
		});

		alert.show();
	}

	public void viewModelDetailInNewActivity(View v) {
		Log.d("viewModelDetailInNewActivity", "viewModelDetailInNewActivity");
		Intent intent = new Intent(this, ViewCardActivity.class);
		intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
		startActivity(intent);
	}

	@Override
	public void setInitialMinuteCount(int nbMinutes) {
		BattleSingleton.getInstance().reInitAndConfigChrono(nbMinutes);

		FragmentManager fragmentManager = getSupportFragmentManager();
		
		if (fragmentManager.findFragmentByTag(ChronoFragment.ID) != null) {
			((ChronoFragment) fragmentManager.findFragmentByTag(ChronoFragment.ID)).updateDisplay();
		}

	}

	@Override
	public boolean useSingleClick() {
		return false;
	}

	@Override
	protected void onPause() {
		super.onPause();
		StorageManager.saveBattle(getApplicationContext(), armyName, BattleSingleton.getInstance());
	}
	
	/**
	 * switch view to the "selected" panel
	 * @param view
	 */
	public void toPlayer2(View v) {
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		if (viewSwitcher.getCurrentView().getId() == R.id.player1_zone  ) {
			Animation slideRightAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_left);
			viewSwitcher.setInAnimation(slideRightAnimation);
			viewSwitcher.showNext();	
		}
	}

	/**
	 * switch view to the "selection" panel
	 * @param view
	 */
	public void toPlayer1(View v) {
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		if (viewSwitcher.getCurrentView().getId() == R.id.player2_zone ) {
			Animation slideLeftAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_right);
			viewSwitcher.setInAnimation(slideLeftAnimation);
			viewSwitcher.showPrevious();	
		}
	}
	

    /**
     * {@inheritDoc}
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getSupportMenuInflater().inflate(R.menu.battle_menu, menu);
        // getSupportActionBar().
        
        
        
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.HONEYCOMB) {
        	menu.findItem(R.id.menu_more).setVisible(false);
        }
        
        handleMenuVisibility(menu);
        
        return true;
    }
    
    
    @Override
	public boolean onPrepareOptionsMenu(Menu menu) {

        // call invalidateOptionsMenu() to force menu reload!
		super.onPrepareOptionsMenu(menu);

		handleMenuVisibility(menu);
	    return true;
	}
    
    /**
     * handle visibility of various menu depending on application status
     * @param menu
     */
    private void handleMenuVisibility(Menu menu) {
    	
    	if (BattleSingleton.getInstance().hasPlayer2()) {
    		menu.findItem(R.id.menu_add_army).setVisible(false);	
    	} else {
    		menu.findItem(R.id.menu_add_army).setVisible(true);
    	}
    	
    	if (FAKE_BT) {
    		menu.findItem(R.id.discoverable).setVisible(false);	
    		menu.findItem(R.id.secure_connect_scan).setVisible(true);
    	} else {
    		
    		if (beddernetService == null) {
    			menu.findItem(R.id.startBeddernet).setVisible(true);
        		menu.findItem(R.id.discoverable).setVisible(false);
        		menu.findItem(R.id.secure_connect_scan).setVisible(false);
    		} else {
    			menu.findItem(R.id.startBeddernet).setVisible(false);
        		menu.findItem(R.id.discoverable).setVisible(true);
        		menu.findItem(R.id.secure_connect_scan).setVisible(true);
    		}
    		
        	if ( BluetoothAdapter.getDefaultAdapter() == null) {
            	// no bluetooth...
            } else {
            	
//            	if ( mBluetoothAdapter == null || mBluetoothAdapter.getScanMode() !=
//                        BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) {
//            		menu.findItem(R.id.discoverable).setVisible(true);	
//            		menu.findItem(R.id.secure_connect_scan).setVisible(false);
//            	}
//            	if (mBluetoothAdapter != null && mBluetoothAdapter.getScanMode() == BluetoothAdapter.SCAN_MODE_CONNECTABLE_DISCOVERABLE) {
//            		menu.findItem(R.id.discoverable).setVisible(false);
//            		menu.findItem(R.id.secure_connect_scan).setVisible(true);
//            	}
            }    		
    	}
    	

    	
    }
	
    public void choosePlayer2() {
    	
		DialogFragment dialog = new ChooseArmyListDialog();
		dialog.show(getSupportFragmentManager(), "ChooseArmyListDialog");

//		final List<ArmyListDescriptor> armyLists = StorageManager.getArmyLists(getApplicationContext());
//
//		AlertDialog.Builder alert = new AlertDialog.Builder(this);
//		alert.setTitle(R.string.choose_player2);
//		alert.setItems(getArmyLabels(armyLists), new DialogInterface.OnClickListener() {
//            public void onClick(DialogInterface dialog, int which) {
//            	ArmyListDescriptor selectedArmy = armyLists.get(which);
//            	
//            	StorageManager.createBattleFromArmy(getApplicationContext(), selectedArmy.getFileName(), BattleSingleton.getInstance(), BattleSingleton.PLAYER2);
//            	
//            	BattleListFragment player2Fragment = new BattleListFragmentPlayer2();
//        		FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
//        		ft.replace(R.id.fragment_player2_placeholder, player2Fragment);
//        		ft.commit();
//        
//        		
//        		updateTwoPlayerLayout();
//        		updateTitleAndSaveBattle(selectedArmy.getFileName());
//        		}
//		});
//		alert.show();
		
    }

    private void updateTitleAndSaveBattle(String player2FileName) {
    	armyName = armyName + " vs. " + player2FileName;
    	StorageManager.saveBattle(getApplicationContext(), armyName, BattleSingleton.getInstance());
    	getIntent().putExtra(INTENT_ARMY, armyName);
    	
    	getSupportActionBar().setTitle(armyName);
    }
    
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
		switch (item.getItemId()) {
	        case R.id.menu_add_army:
	            choosePlayer2();
	            return true;
	        case R.id.menu_chrono:
	        	openChronoConfig(null);
	            return true;
	        case R.id.menu_end:
	        	endBattle(null);
	        	return  true;
	        case R.id.menu_card_reference:
	        	openCardLibrary();
	        	return true;
	        case R.id.menu_more:
	        	openOptionsMenu();
	        	return true;
	        case R.id.startBeddernet: 
				bindService(new Intent(this, MyBeddernetService.class), mConnection,
	        	        Context.BIND_AUTO_CREATE);
	        	startService(new Intent(BattleActivity.this, MyBeddernetService.class));
	        case R.id.secure_connect_scan:
				if (beddernetService == null) {
					Toast.makeText(BattleActivity.this, "Not connected to BlueTooth service", Toast.LENGTH_SHORT).show();
				} else {
					beddernetService.findNeighbors();	
				}
	            return true;
	        case R.id.discoverable:
	            // Ensure this device is discoverable by others
	        	if (beddernetService == null) {
	        		Toast.makeText(BattleActivity.this, "Not connected to BlueTooth service", Toast.LENGTH_SHORT).show();
	        	} else {
	        		beddernetService.setDiscoverable(true);	
	        	}
	            return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}	
	
	private MyBeddernetService beddernetService;

	private ServiceConnection mConnection = new ServiceConnection() {

		public void onServiceConnected(ComponentName className, IBinder binder) {
			beddernetService = ((MyBeddernetService.MyBinder) binder)
					.getService();
			
			beddernetService.registerHandler(mHandler);
			
			Toast.makeText(BattleActivity.this, "Connected to BlueTooth service", Toast.LENGTH_SHORT)
					.show();
			
			beddernetService.activateBT(true); 
			
			invalidateOptionsMenu();
		}

		public void onServiceDisconnected(ComponentName className) {
			beddernetService = null;
		}
	};


	private void openCardLibrary() {
		
		FragmentManager fm = getSupportFragmentManager();
		ChooseCardFromLibraryDialog dialog = new ChooseCardFromLibraryDialog();
		dialog.setShowsDialog(true);
		dialog.show(fm, "Card library dialog");
	}
	
	/**
	 * force display to accomodate 1 or 2 player depending on layout disposition (large screen, landscape, ...)
	 */
	public void updateTwoPlayerLayout() {
		
		Log.d("BattleActivity", "updateTwoPlayerLayout");
		
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		
		// player1_zone
		// toRightButton
		
		if (BattleSingleton.getInstance().hasPlayer2()) {
			Log.d("BattleActivity", "updateTwoPlayerLayout : 2 players");
			if (viewSwitcher != null) {
				// switcher, make sure button is visible
				ImageButton toRightButton = (ImageButton) findViewById(R.id.toRightButton);
				toRightButton.setVisibility(View.VISIBLE);
			} else {
				// fullscreen, make sure placeHolder for player2 is visible
				FrameLayout player2PlaceHolder = (FrameLayout) findViewById(R.id.fragment_player2_placeholder);
				player2PlaceHolder.setVisibility(View.VISIBLE);
			}
			
			if ( findViewById(R.id.layout_chrono_and_card) != null) {
				
				LinearLayout chronoCardLayout = (LinearLayout) findViewById(R.id.layout_chrono_and_card);
				LayoutParams params = (LayoutParams) chronoCardLayout.getLayoutParams();
				params.weight = 1;
				chronoCardLayout.invalidate();
				
				// mask chrono only if 2 players and a card already visible.
				FragmentManager fragmentManager = getSupportFragmentManager();
				if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
					if ( findViewById(R.id.chrono_zone) != null) {
						findViewById(R.id.chrono_zone).setVisibility(View.GONE);
					}
				}
				
				
			}

			
		} else {
			Log.d("BattleActivity", "updateTwoPlayerLayout : 1 player");
			if (viewSwitcher != null) {
				// switcher, make sure button is invisible
				ImageButton toRightButton = (ImageButton) findViewById(R.id.toRightButton);
				toRightButton.setVisibility(View.GONE);
			} else {
				// fullscreen, make sure placeHolder for player2 is masked
				FrameLayout player2PlaceHolder = (FrameLayout) findViewById(R.id.fragment_player2_placeholder);
				player2PlaceHolder.setVisibility(View.GONE);
				
				// change layout weight to accomodate more screen for cards
				if ( findViewById(R.id.layout_chrono_and_card) != null) {
					
					LinearLayout chronoCardLayout = (LinearLayout) findViewById(R.id.layout_chrono_and_card);
					LayoutParams params = (LayoutParams) chronoCardLayout.getLayoutParams();
					params.weight = 2;
					chronoCardLayout.invalidate();
					
				}
				
				
			}
			
		}
		
		invalidateOptionsMenu();

		// if card not showing, hide zone
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) == null) {
			FrameLayout cardZone = (FrameLayout) findViewById(R.id.card_zone);
			if (cardZone != null) {
				cardZone.setVisibility(View.GONE);	
			}
		}
		
	}
	
	private void updateChronoLayout() {
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		
		FragmentManager fragmentManager = getSupportFragmentManager();
		ChronoFragment chrono = (ChronoFragment) fragmentManager.findFragmentByTag(ChronoFragment.ID);
		
		if (viewSwitcher != null) {
			// small screen, handle chrono fullscreen or reduced
			
			if (BattleSingleton.getInstance().isFullScreenChrono()) {
				chrono.setFullScreen(true);
				chrono.setShowSlideButtons(true);
				viewSwitcher.setVisibility(View.GONE);
			} else {
				chrono.setFullScreen(false);
				chrono.setShowSlideButtons(true);
				viewSwitcher.setVisibility(View.VISIBLE);
			}
			
		} else {
			// big landscape screen, chrono has its own static place
			chrono.setFullScreen(true);
			chrono.setShowSlideButtons(false);
		}
	}

	@Override
	public void openChronoConfig(View v) {
		ChronoConfigDialog dialog = new ChronoConfigDialog();
		dialog.show(this.getSupportFragmentManager(), "ChronoConfigDialog");
	}

	@Override
	public void shrinkChrono(View v) {
		BattleSingleton.getInstance().setFullScreenChrono(false);
		updateChronoLayout();
		
	}

	@Override
	public void expandChrono(View v) {
		BattleSingleton.getInstance().setFullScreenChrono(true);
		updateChronoLayout();
	}
	

	

	@Override
	public void onArmyListSelected(ArmyListDescriptor selectedArmy) {
    	
    	StorageManager.createBattleFromArmy(getApplicationContext(), selectedArmy.getFileName(), BattleSingleton.getInstance(), BattleSingleton.PLAYER2);
    	
    	BattleListFragment player2Fragment = new BattleListFragmentPlayer2();
		FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
		ft.replace(R.id.fragment_player2_placeholder, player2Fragment);
		ft.commit();

		
		updateTwoPlayerLayout();
		updateTitleAndSaveBattle(selectedArmy.getFileName());
	
	}

	@Override
	public void onArmyListDeleted(ArmyListDescriptor army) {
	}

	public void endBattle(View v) {
		DialogFragment dialog = new EndBattleDialog();
        dialog.show(getSupportFragmentManager(), "EndBattleDialog");
	}


	@Override
	public void endBattle(int winnerNumber, String player2name,
			String clockType, String scenario, String victoryCondition,
			String notes) {
		BattleResult result = new BattleResult();
		
		result.setArmyName(armyName);
		result.setBattleDate(new Date());
		result.setWinnerNumber(winnerNumber);
		result.setPlayer2name(player2name);
		result.setClockType(clockType);
		result.setScenario(scenario);
		result.setVictoryCondition(victoryCondition);
		result.setNotes(notes);
		
		result.setArmy1(BattleSingleton.getInstance().getArmy(BattleSingleton.PLAYER1));
		
		if (BattleSingleton.getInstance().hasPlayer2()) {
			result.setArmy2(BattleSingleton.getInstance().getArmy(BattleSingleton.PLAYER2));
		}
		
		StorageManager.saveBattleResult(getApplicationContext(), result );

		BattleSingleton.getInstance().stopChronos();
		
		StorageManager.saveBattle(getApplicationContext(), armyName, BattleSingleton.getInstance());
		Toast.makeText(getApplicationContext(), "Battle saved, exiting", Toast.LENGTH_SHORT).show();

		BattleActivity.this.finish();
	}

	@Override
	public void viewModelDetail(View v) {
		
		FragmentManager fragmentManager = getSupportFragmentManager();

		if (findViewById(R.id.card_zone) != null) {
			// create new fragment
			FragmentTransaction fragmentTransaction = fragmentManager
					.beginTransaction();

			FrameLayout cardZone = (FrameLayout) findViewById(R.id.card_zone);
			cardZone.setVisibility(View.VISIBLE);

			if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
				fragmentTransaction.remove(fragmentManager
						.findFragmentByTag(ViewCardFragment.ID));
			}
			ViewCardFragment viewCardFragment = new ViewCardFragment();
			fragmentTransaction.add(R.id.card_zone, viewCardFragment,
					ViewCardFragment.ID);
			fragmentTransaction.commit();

			if (BattleSingleton.getInstance().hasPlayer2())  {
				// mask chrono only if 2 players...
				if ( findViewById(R.id.chrono_zone) != null) {
					findViewById(R.id.chrono_zone).setVisibility(View.GONE);
				}
			}

			
		} else {

			// open new activity
			Intent intent = new Intent(this, ViewCardActivity.class);
			intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
			startActivity(intent);

		}
	}


    // The Handler that gets information back from the BluetoothChatService
    private final Handler mHandler = new BattleActivityHandler(this);
    
    /**
     * treat an incoming message about a damagegrid modified
     * @param damageGrid
     */
	public void handleIncomingDamageFromBT(DamageGrid damageGrid) {
		
    	Toast.makeText(this, "Damage grid update " + damageGrid.toString(), Toast.LENGTH_SHORT).show();
		
        List<BattleEntry> entries = BattleSingleton.getInstance().getEntries(BattleSingleton.PLAYER2);
        
        int targetId = damageGrid.getUniqueId();
        Log.d(TAG, "target id = " + targetId);
        
        for (BattleEntry entry : entries) {
        	Log.d(TAG, "found player2 entries = " + entry.toString());
        	if (entry.hasDamageGrid()) {
        		DamageGrid targetGrid = ((MultiPVModel) entry).getDamageGrid();
        		Log.d(TAG, "grid id = " + targetGrid.getUniqueId());
        		if (targetId == targetGrid.getUniqueId()) {
        			Log.d(TAG, "found target grid = " + targetGrid);
        			targetGrid.copyStatusFrom(damageGrid);
        		}
        	}
        }

	}

    
    public final void setStatus(CharSequence subTitle) {
        final ActionBar actionBar = getSupportActionBar();
        actionBar.setSubtitle(subTitle);
    }
	
    public final void setStatus(int resId) {
        final ActionBar actionBar = getSupportActionBar();
        actionBar.setSubtitle(resId);
    }
    
    
    /**
     * Sends a message.
     * @param message  A string of text to send.
     */
    public void sendArmyListTroughBlueTooth(DeviceVO device) {
    	
    	
    	if (beddernetService == null) {
    		Toast.makeText(this, "beddernetService not available", Toast.LENGTH_SHORT).show();
    		return;
    	}
    	
        BattleCommunicationObject out = new BattleCommunicationObject();
        out.setAction(CommAction.START_ARMY_LIST);
        beddernetService.sendMessage(device, out);
        
        List<BattleEntry> entries = BattleSingleton.getInstance().getEntries(BattleSingleton.PLAYER1);
        
        int uniqueId = 1;
        
        for (BattleEntry entry : entries) {
            BattleCommunicationObject sendEntry = new BattleCommunicationObject();
            sendEntry.setAction(CommAction.ADD_ENTRY);
            sendEntry.setBattleEntry(entry);
            
            if (entry.hasDamageGrid()) {
            	// assign unique ID to grid, to ensure no mismatch
            	if (((MultiPVModel)entry).getDamageGrid().getUniqueId() == 0) {
            		((MultiPVModel)entry).getDamageGrid().setUniqueId(uniqueId ++);	
            	}
            }
            
            beddernetService.sendMessage(device, sendEntry);
        }
        
        BattleCommunicationObject end = new BattleCommunicationObject();
        end.setAction(CommAction.END_ARMY_LIST);
        beddernetService.sendMessage(device, end);
        
    }

    /**
     * Sends a message.
     * @param message  A string of text to send.
     */
    public void registerDamageGridToBlueTooth() {
        List<BattleEntry> entries = BattleSingleton.getInstance().getEntries(BattleSingleton.PLAYER1);
        for (BattleEntry entry : entries) {
        	if (entry.hasDamageGrid()) {
        		// ((MultiPVModel) entry).getDamageGrid().registerCommitObserver(mWhacService);
        	}
        }
    }


    @Override
    public void onDestroy() {
        super.onDestroy();
        
        // unbind beddernet service
        if(D) Log.e(TAG, "unbinding beddernet service");
        if (beddernetService != null) {
        	unbindService(mConnection);	
        }
        if(D) Log.e(TAG, "--- ON DESTROY ---");
    }

	public void blueToothOff() {
		Toast.makeText(this, "bluetooth turned off", Toast.LENGTH_SHORT).show();
		setStatus("bluetooth off");
		invalidateOptionsMenu();
	}
	
	public void blueToothOn() {
		if (D) Log.d(TAG, "blueToothOn");
		setStatus("bluetooth on");
		invalidateOptionsMenu();
	}

	public void updateDevicesAvailable() {
		if (D) Log.d(TAG, "updateDevicesAvailable");
		setStatus("bluetooth devices found");
		
		if (beddernetService != null && beddernetService.getAvailableDevices() != null) {
			if ( beddernetService.getAvailableDevices().size() > 1) {
				// ask which device to connect
				DialogFragment dialog = new ChooseBluetoothListDialog();
				dialog.show(getSupportFragmentManager(), "ChooseBluetoothListDialog");
			} else if (beddernetService.getAvailableDevices().size() == 1) {
				// directly connect to unique device
				setStatus("connecting to " + beddernetService.getAvailableDevices().get(0));
			}
			
		}
		

		
		
		
		invalidateOptionsMenu();
	}

	/**
	 * notify that BT stack starts receiving an army
	 */
	public void receivingArmy() {
		if (D) Log.d(TAG, "receivingArmy");
    	setStatus("Receiving army list...");
    	BattleSingleton.getInstance().startLoadingArmy2();
	}


	/**
	 * notify that BT stack received an army (end transmit signal)
	 */
	public void receivedArmy() {
		if (D) Log.d(TAG, "receivedArmy");
    	setStatus("Army list received");
    	BattleSingleton.getInstance().finishLoadingArmy2();
    	
    	BattleListFragment player2Fragment = new BattleListFragmentPlayer2();
		FragmentTransaction ft = getSupportFragmentManager().beginTransaction();
		ft.replace(R.id.fragment_player2_placeholder, player2Fragment);
		ft.commit();
		
		updateTwoPlayerLayout();
		registerDamageGridToBlueTooth();
		
	}

	@Override
	public void onDeviceSelected(DeviceVO device) {
		sendArmyListTroughBlueTooth(device);
	}

	@Override
	public List<DeviceVO> getCandidateDevices() {
		if (beddernetService != null ) {
			return beddernetService.getAvailableDevices();
		}
		return new ArrayList<DeviceVO>();
	}

}
