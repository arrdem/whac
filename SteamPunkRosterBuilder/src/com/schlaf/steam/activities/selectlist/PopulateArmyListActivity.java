/**
 * 
 */
package com.schlaf.steam.activities.selectlist;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Locale;

import android.annotation.SuppressLint;
import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.os.Bundle;
import android.os.Vibrator;
import android.preference.PreferenceManager;
import android.support.v4.app.DialogFragment;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.text.Html;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.view.animation.Animation;
import android.view.animation.AnimationUtils;
import android.widget.EditText;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;
import android.widget.ViewSwitcher;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.actionbarsherlock.view.Menu;
import com.actionbarsherlock.view.MenuItem;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.PreferenceConstants;
import com.schlaf.steam.activities.battle.BattleActivity;
import com.schlaf.steam.activities.card.ChooseCardFromLibraryDialog;
import com.schlaf.steam.activities.card.ViewCardActivity;
import com.schlaf.steam.activities.card.ViewCardFragment;
import com.schlaf.steam.activities.card.ViewCardFragment.ViewCardActivityInterface;
import com.schlaf.steam.activities.selectlist.ChooseArmyOptionsDialog.ArmySettingListener;
import com.schlaf.steam.activities.selectlist.selected.JackCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedArmyCommander;
import com.schlaf.steam.activities.selectlist.selected.SelectedEntry;
import com.schlaf.steam.activities.selectlist.selected.SelectedUnit;
import com.schlaf.steam.activities.selectlist.selection.SelectionEntry;
import com.schlaf.steam.activities.selectlist.selection.SelectionSolo;
import com.schlaf.steam.activities.selectlist.selection.SelectionUnit;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Contract;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.data.ModelTypeEnum;
import com.schlaf.steam.data.Tier;
import com.schlaf.steam.data.UnitOption;
import com.schlaf.steam.storage.StorageManager;

/**
 * @author S0085289
 * 
 */
public class PopulateArmyListActivity extends SherlockFragmentActivity implements ArmySelectionChangeListener, ViewCardActivityInterface, ArmySettingListener {

	public static String INTENT_START_NEW_ARMY = "start_new_army";
	public static String INTENT_FIRT_START = "first_start";
	public static String INTENT_FACTION = "faction";
	
	/** adapteur de la liste de sélection */
//	ListSelectionAdapter selectionAdapter;
	/** adapteur de la liste de sélectionnés */
//	ListSelectedAdapter selectedAdapter;
	
	
	
//	/** name of the file under which the army is saved */
//	private String armyName;
//	
//	/** indicate that army is saved */
//	private boolean armySaved;
	
	/** if true, single panel + selected army zone on screen . if "back", then revert to selection zone instead
	 * of closing activity
	 */
	private boolean onSelectedArmyZone = false;
	
	/**
	 * indicate to open card view on single click (if false, use longclick)
	 */
	private boolean selectionModeSingleClick;
	
    /**
     * {@inheritDoc}
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getSupportMenuInflater().inflate(R.menu.build_army_menu, menu);
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
		if (SelectionModelSingleton.getInstance().getFaction().equals(FactionNamesEnum.MERCENARIES) || 
				SelectionModelSingleton.getInstance().getFaction().equals(FactionNamesEnum.MINIONS)) {
				menu.findItem(R.id.menu_contract).setVisible(true);
			} else {
				menu.findItem(R.id.menu_contract).setVisible(false);	
			}
			
			if (SelectionModelSingleton.getInstance().isSaved()) {
				menu.findItem(R.id.menu_save).setVisible(false);
				menu.findItem(R.id.menu_battle).setVisible(true);
			} else {
				menu.findItem(R.id.menu_save).setVisible(true);
				menu.findItem(R.id.menu_battle).setVisible(false);
			}
    }

    

	//    @Override
//	public boolean onCreateOptionsMenu(Menu menu) {
//		getSupportMenuInflater().inflate(R.menu.build_army_menu, menu);
//	    return super.onCreateOptionsMenu(menu);
//	}	
//	
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
		switch (item.getItemId()) {
			case R.id.menu_collapse: 
				collapseSelection();
				return true;
	        case R.id.menu_save:
	            saveArmy();
	            return true;
	        case R.id.menu_save_as:
	            saveArmyAs();
	            return true;
	        case R.id.menu_cancel:
	            cancel();
	            return true;
	        case R.id.menu_tiers: 
	        	chooseTier();
	        	return true;
	        case R.id.menu_contract: 
	        	chooseContract();
	        	return true;
	        case R.id.menu_battle: 
	        	battle();
	        	return true;
	        case R.id.menu_prefs:
	            chooseOptions(null);
	            return true;
	        case R.id.menu_card_reference:
	        	openCardLibrary();
	        	return true;
	        case R.id.menu_more:
	            openOptionsMenu();
	            return true;
	        case android.R.id.home: 
	        	navigateHome();
	        	return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}	
	
	private void collapseSelection() {
		
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(SelectionArmyFragment.ID) != null) {
		
			SelectionArmyFragment fragment = (SelectionArmyFragment) fragmentManager.findFragmentByTag(SelectionArmyFragment.ID);
			fragment.collapseAll();

		} 
		
	}
	
	private void openCardLibrary() {
		
		FragmentManager fm = getSupportFragmentManager();
		ChooseCardFromLibraryDialog dialog = new ChooseCardFromLibraryDialog();
		dialog.setShowsDialog(true);
		dialog.show(fm, "Card library dialog");
	}
	
	/**
	 * launch the battle activity with current army
	 */
	private void battle() {
		if (!SelectionModelSingleton.getInstance().isSaved()) {
			Toast.makeText(getApplicationContext(), "Army not saved : save before launching battle", Toast.LENGTH_SHORT).show();
			return;
		}
		
		// open battle activity
		Intent intent = new Intent(this, BattleActivity.class);
		intent.putExtra(BattleActivity.INTENT_CREATE_BATTLE_FROM_ARMY, true);
		intent.putExtra(BattleActivity.INTENT_ARMY, SelectionModelSingleton.getInstance().getArmyFileName());
		startActivity(intent);
		
	}
	
	/**
	 * ask for tier (open popup dialog)
	 */
	private void chooseTier() {
		
		final List<Tier> tiers = ArmySingleton.getInstance().getTiers(SelectionModelSingleton.getInstance().getFaction());

		AlertDialog.Builder alert = new AlertDialog.Builder(this);
		alert.setTitle(R.string.choose_tier);
		alert.setItems(getTierLabels(tiers), new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {
        		if (which == 0) {
        			SelectionModelSingleton.getInstance().setCurrentTiers(null);
        		} else {
        			SelectionModelSingleton.getInstance().setCurrentTiers(tiers.get(which-1));
        		}       
				
				notifyArmyChange();
        		}
		});
		alert.show();
	}	
	
	/**
	 * ask for contract (open popup dialog)
	 */
	private void chooseContract() {
		
		final List<Contract> contracts = ArmySingleton.getInstance().getContracts(SelectionModelSingleton.getInstance().getFaction());

		AlertDialog.Builder alert = new AlertDialog.Builder(this);
		alert.setTitle(R.string.choose_contract);
		alert.setItems(getContractLabels(contracts), new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {
        		if (which == 0) {
        			SelectionModelSingleton.getInstance().setCurrentContract(null);
        		} else {
        			SelectionModelSingleton.getInstance().setCurrentContract(contracts.get(which-1));
        		}       
				notifyArmyChange();
        		}
		});
		alert.show();
	}		

	/**
	 * return available tiers labels
	 * @param tiers
	 * @return
	 */
	private String[] getTierLabels(List<Tier> tiers) {
		ArrayList<String> result = new ArrayList<String>();
		result.add("None");
		for (Tier tier : tiers) {
			// String casterName = ArmySingleton.getInstance().getArmyElement(tier.getCasterId()).getFullName();
			String tiersEntry =  tier.getTitle();
			result.add(tiersEntry);
		}
		return result.toArray(new String[result.size()]);
	}
	
	/**
	 * return available tiers labels
	 * @param tiers
	 * @return
	 */
	private String[] getContractLabels(List<Contract> contracts) {
		ArrayList<String> result = new ArrayList<String>();
		result.add("None");
		for (Contract contract : contracts) {
			String contractName = contract.getTitle();
			result.add(contractName);
		}
		return result.toArray(new String[result.size()]);
	}

	private void cancel() {
		
		AlertDialog.Builder alert = new AlertDialog.Builder(this);
		alert.setTitle("You are about to clean the army list");
		alert.setMessage("Reset current army selection?");
		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
		public void onClick(DialogInterface dialog, int whichButton) {
			PopulateArmyListActivity.this.resetArmyList();
		}
		});
		alert.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
		  public void onClick(DialogInterface dialog, int whichButton) {
		    // Canceled.
		  }
		});
		alert.show();
		
	}

	private void resetArmyList() {
		Toast.makeText(getApplicationContext(), "Cancel army", Toast.LENGTH_SHORT).show();
		SelectionModelSingleton.getInstance().cleanAll();
		notifyArmyChange();		
	}
	
	private void saveArmy() {
		
		if ( ! SelectionModelSingleton.getInstance().hasValidFileName()) {
			saveArmyAs();
		} else {
			StorageManager.saveArmyList(PopulateArmyListActivity.this.getApplicationContext(), SelectionModelSingleton.getInstance());
			Toast.makeText(getApplicationContext(), "Army saved", Toast.LENGTH_SHORT).show();
			updateTitles();
		}
	}
	
	
	private void saveArmyAs() {
		
		AlertDialog.Builder alert = new AlertDialog.Builder(this);

		alert.setTitle("Save army as");
		alert.setMessage("choose army filename");

		// Set an EditText view to get user input 
		final EditText input = new EditText(this);
		
		String proposal_file_name = "new_army";
		for (SelectedEntry entry : SelectionModelSingleton.getInstance().getSelectedEntries()) {
			if (entry instanceof SelectedArmyCommander) {
				proposal_file_name = StorageManager.fixFileNameForSave(entry.getLabel()); 
				
				SimpleDateFormat sdf = new SimpleDateFormat("yyyyMMdd-kkmm", Locale.getDefault());
				if (proposal_file_name.length() > 8) {
					proposal_file_name = proposal_file_name.substring(0, 8);
				}
				proposal_file_name =  proposal_file_name + sdf.format(new Date()); 
			}
		}
		
		input.setText(proposal_file_name);
		
		alert.setView(input);

		alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
		public void onClick(DialogInterface dialog, int whichButton) {
		  String value = input.getText().toString();
		  
		  String validFileName = StorageManager.fixFileNameForSave(value);
		  SelectionModelSingleton.getInstance().setArmyFileName(validFileName);
		  
		  StorageManager.saveArmyList(PopulateArmyListActivity.this.getApplicationContext(), SelectionModelSingleton.getInstance());
		  Toast.makeText(getApplicationContext(), "Army saved", Toast.LENGTH_SHORT).show();
		  
		  // update status
		  PopulateArmyListActivity.this.updateTitles();

		  }
		});

		alert.setNegativeButton("Cancel", new DialogInterface.OnClickListener() {
		  public void onClick(DialogInterface dialog, int whichButton) {
		    // Canceled.
			  Toast.makeText(getApplicationContext(), "Army not saved", Toast.LENGTH_SHORT).show();
		  }
		});

		alert.show();
	}

	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		
		
		super.onCreate(savedInstanceState);
		
		setContentView(R.layout.populate_army_list_layout_fragmented);

		Intent intent = getIntent();
		String factionId = intent.getStringExtra(INTENT_FACTION);
		
		
		FactionNamesEnum factionEnum = FactionNamesEnum.getFaction(factionId);

		SelectionModelSingleton.getInstance().setFaction(factionEnum);
		
		// getSupportActionBar().setHomeButtonEnabled(true);
		getSupportActionBar().setLogo(R.drawable.edit_list_icon);
		getSupportActionBar().setTitle("");
		
		LinearLayout cardZone = (LinearLayout) findViewById(R.id.card_zone);
		if (cardZone != null) {
			FragmentManager fragmentManager = getSupportFragmentManager();
			if ( fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null && fragmentManager.findFragmentByTag(ViewCardFragment.ID).isAdded() ) {
				Log.d("PopulateArmyList", "viewCardFragment here --> cardZone VISIBLE");
				cardZone.setVisibility(View.VISIBLE);
			} else {
				Log.d("PopulateArmyList", "cardZone --> GONE");
				cardZone.setVisibility(View.GONE);
			}
		}
		
		//notifyArmyChange();
	}

	@Override
	protected void onStart() {
		Log.d("PopulateArmyListActivity", "onStart");
		super.onStart();
		boolean startNewArmy = getIntent().getBooleanExtra(INTENT_START_NEW_ARMY, false);
		
		SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
		selectionModeSingleClick = sharedPref.getBoolean(PreferenceConstants.ACCESS_SIMPLE_CLICK, PreferenceConstants.ACCESS_SIMPLE_CLICK_DEFAULT);
		
		if (startNewArmy) {
			SelectionModelSingleton.getInstance().cleanAll();
			// chooseOptions(null);
			
			String armySize = sharedPref.getString(PreferenceConstants.ARMY_SIZE, PreferenceConstants.ARMY_SIZE_DEFAULT);
			String casterCount = sharedPref.getString(PreferenceConstants.CASTER_COUNT, PreferenceConstants.CASTER_COUNT_DEFAULT);
			changeArmySettings(Integer.valueOf(casterCount), Integer.valueOf(armySize));
			
		} else {
//			// update status, army already loaded in singleton by some previous activity
//			if ( getIntent().getBooleanExtra(INTENT_FIRT_START,true)) {
//				armyName = SelectionModelSingleton.getInstance().getArmyFileName();
//				armySaved = true;
//			} else {
//				// nothing, the window is just re-appearing...
//			}
		}
		// call only one time the popup!
		getIntent().removeExtra(INTENT_START_NEW_ARMY);
		
		// because onStart is called after onActivityResult or rotate screen, make sure no reinitilisation is done
		getIntent().putExtra(INTENT_FIRT_START, false);
		
		SelectionModelSingleton.getInstance().rebuildSelectionEntries();
		SelectionModelSingleton.getInstance().recomposeSelectionList();
		SelectionModelSingleton.getInstance().checkAndAlterSelectionList();

		invalidateOptionsMenu(); // force menu computing to show tier / contract depending on regular/merc faction
		
		notifyArmyChange();
		

	}

	/**
	 * switch view to the "selected" panel
	 * @param view
	 */
	public void toSelectedArmy(View v) {
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		if (viewSwitcher.getCurrentView().getId() == R.id.selection_zone  ) {
			Animation slideRightAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_left);
			viewSwitcher.setInAnimation(slideRightAnimation);
			viewSwitcher.showNext();	
		}
		onSelectedArmyZone = true;
	}

	/**
	 * switch view to the "selection" panel
	 * @param view
	 */
	public void toSelectionArmy(View v) {
		ViewSwitcher viewSwitcher = (ViewSwitcher) findViewById(R.id.viewSwitcher1);
		if (viewSwitcher.getCurrentView().getId() == R.id.selected_zone ) {
			Animation slideLeftAnimation = AnimationUtils.loadAnimation(this, R.anim.slide_right);
			viewSwitcher.setInAnimation(slideLeftAnimation);
			viewSwitcher.showPrevious();	
		}
		onSelectedArmyZone = false;
	}

	/**
	 * notifie les couches graphique de la modification de sélection
	 */
	public void notifyArmyChange() {

		SelectionModelSingleton.getInstance().recomposeSelectionList();
		SelectionModelSingleton.getInstance().checkAndAlterSelectionList();
		
		SelectionArmyFragment selectionfragment = (SelectionArmyFragment) getSupportFragmentManager()
				.findFragmentByTag(SelectionArmyFragment.ID);
		if (selectionfragment != null && selectionfragment.isInLayout()) {
			selectionfragment.notifyDataSetChanged();
		}		
		
		SelectedArmyFragment selectedfragment = (SelectedArmyFragment) getSupportFragmentManager()
				.findFragmentByTag(SelectedArmyFragment.ID);
		if (selectedfragment != null && selectedfragment.isInLayout()) {
			selectedfragment.notifyDataSetChanged();
		}		
		
		updateTitles();
		
		
	}
	
	public void updateTitles() {
		String compendium = SelectionModelSingleton.getInstance().getSelectedCompendium();
		
		TextView titleSelected = (TextView) findViewById(R.id.selected_army_title);
		titleSelected.setText(Html.fromHtml(compendium));

		getSupportActionBar().setTitle(SelectionModelSingleton.getInstance().getArmyFileName());
		
		// compendium for selection list
		TextView textCompendium = (TextView) findViewById(R.id.compendium);
		textCompendium.setText(Html.fromHtml(compendium));

		
		// tier display
		LinearLayout selectedTitleLayout = (LinearLayout) findViewById(R.id.selected_army_title_layout);
		LinearLayout selectionTitleLayout = (LinearLayout) findViewById(R.id.selection_army_title_layout);

		displayTierLevel(selectedTitleLayout);
		displayTierLevel(selectionTitleLayout);

		
		// notify of tier change
		if (SelectionModelSingleton.getInstance().isTierLevelJustChanged()) {
			SelectionModelSingleton.getInstance().acknowledgeTierLevelChange();
			Toast.makeText(this, "Tier level attained : " + SelectionModelSingleton.getInstance().getCurrentTiersLevel(), Toast.LENGTH_SHORT).show();
		}

		
		// contract display
		if (SelectionModelSingleton.getInstance().getCurrentContract() != null) {
			selectionTitleLayout.findViewById(R.id.contract_icon).setVisibility(View.VISIBLE);	
		} else {
			selectionTitleLayout.findViewById(R.id.contract_icon).setVisibility(View.GONE);
		}
		
		
		// force menu redraw
		invalidateOptionsMenu();
		
		
	}

	/**
	 * update display of title zone to notify of the tier level attained.
	 * @param titleLayout
	 */
	private void displayTierLevel(LinearLayout titleLayout) {
		TextView titleTier = (TextView) titleLayout.findViewById(R.id.tier_title);
		ImageView tierLevelIcon = (ImageView) titleLayout.findViewById(R.id.tier_level_icon);

		if (SelectionModelSingleton.getInstance().getCurrentTiersLevel() > 0) {
			tierLevelIcon.setVisibility(View.VISIBLE);
			titleTier.setVisibility(View.VISIBLE);
			switch (SelectionModelSingleton.getInstance()
					.getCurrentTiersLevel()) {
			case 1:
				tierLevelIcon.setImageResource(R.drawable.tier_level_1);
				break;
			case 2:
				tierLevelIcon.setImageResource(R.drawable.tier_level_2);
				break;
			case 3:
				tierLevelIcon.setImageResource(R.drawable.tier_level_3);
				break;
			case 4:
				tierLevelIcon.setImageResource(R.drawable.tier_level_4);
				break;
			default:
				break;
			}
		} else {
			tierLevelIcon.setVisibility(View.GONE);
			titleTier.setVisibility(View.GONE);
		}
	}

	/**
	 * creates a popup dialog to display Tier conditions and benefits
	 * @param v
	 */
	public void displayTierInfo(View v) {
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(SelectionModelSingleton.getInstance().getCurrentTiers().getTitle());
	    builder.setMessage(Html.fromHtml(SelectionModelSingleton.getInstance().getCurrentTiers().toHtmlString()));
	    builder.show();
	}
	
	/**
	 * creates a popup dialog to display Contract conditions and benefits
	 * @param v
	 */
	public void displayContractInfo(View v) {
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		builder.setTitle(SelectionModelSingleton.getInstance().getCurrentContract().getTitle());
	    builder.setMessage(Html.fromHtml(SelectionModelSingleton.getInstance().getCurrentContract().toHtmlString()));
	    builder.show();
		
	}
	
	@Override
	public void onModelAdded(SelectionEntry entry) {
		if (entry.isSelectable()) {
			if (entry.getType() == ModelTypeEnum.UNIT) {
				if (((SelectionUnit)entry).isVariableSize()) {
					askForUnitDetails((SelectionUnit)entry);	
				} else {
					SelectionModelSingleton.getInstance().addUnit((SelectionUnit)entry, true);
					
				}
				// return of dialog is treated in onActivityResult() method
			} else if (entry.getType() == ModelTypeEnum.WARJACK || entry.getType() == ModelTypeEnum.COLOSSAL ) {
				int candidatesCount = SelectionModelSingleton.getInstance().modelsToWhichAttach(entry).size();
				if (candidatesCount == 0) {
					Toast.makeText(getApplicationContext(), "Sorry, there is actually no model to attach this entry", Toast.LENGTH_SHORT).show();
				} else if ( candidatesCount> 1) {
					askWhoToAttach(entry);
					// return of dialog is treated in onActivityResult() method
				} else{
					SelectionModelSingleton.getInstance().addAttachedElementByDefault(entry);
				}
			} else if (entry.getType() == ModelTypeEnum.WARBEAST || entry.getType() == ModelTypeEnum.GARGANTUAN ) {
				int candidatesCount = SelectionModelSingleton.getInstance().modelsToWhichAttach(entry).size();
				if (candidatesCount == 0) {
					Toast.makeText(getApplicationContext(), "Sorry, there is actually no model to attach this entry", Toast.LENGTH_SHORT).show();
				} else if ( candidatesCount> 1) {
					askWhoToAttach(entry);
					// return of dialog is treated in onActivityResult() method
				} else{
					SelectionModelSingleton.getInstance().addAttachedElementByDefault(entry);
				}
			} else if (entry.getType() == ModelTypeEnum.UNIT_ATTACHMENT || entry.getType() == ModelTypeEnum.WEAPON_ATTACHMENT) {
				int candidatesCount = SelectionModelSingleton.getInstance().modelsToWhichAttach(entry).size();
				if (candidatesCount == 0) {
					Toast.makeText(getApplicationContext(), "Sorry, there is actually no model to attach this entry", Toast.LENGTH_SHORT).show();
				} else if ( candidatesCount > 1) {
					askWhoToAttach(entry);
					// return of dialog is treated in onActivityResult() method
				} else{
					SelectionModelSingleton.getInstance().addAttachedElementByDefault(entry);
				}
			} else if (entry.getType() == ModelTypeEnum.SOLO) {
				SelectionSolo solo = (SelectionSolo) entry;
				if (solo.isWarcasterAttached()) {
					if (SelectionModelSingleton.getInstance().modelsToWhichAttach(entry).size() > 1) {
						askWhoToAttach(entry);
						// return of dialog is treated in onActivityResult() method
					} else{
						SelectionModelSingleton.getInstance().addAttachedElementByDefault(entry);
					}
				} else if (solo.isMercenaryUnitAttached()) {
					int candidatesCount =  SelectionModelSingleton.getInstance().modelsToWhichAttach(entry).size();
					if (candidatesCount > 1) {
						askWhoToAttach(entry);
						// return of dialog is treated in onActivityResult() method
					} else if (candidatesCount == 1 ){
						SelectionModelSingleton.getInstance().addAttachedElementByDefault(entry);
					} else {
						Toast.makeText(getApplicationContext(), "Sorry, there is actually no mercenary unit to attach this entry", Toast.LENGTH_SHORT).show();
					}
				} else if (solo.isDragoon()) {
					askForDismountOption(solo);
				} else {
					SelectionModelSingleton.getInstance().addSolo((SelectionSolo) entry);
				}
			} else if (entry.getType() == ModelTypeEnum.BATTLE_ENGINE) {
				SelectionModelSingleton.getInstance().addBattleEngine(entry); 
			} else {
				SelectionModelSingleton.getInstance().addIndependantModel(entry);
			}
		} else {
			Toast.makeText(this, "this entry is not selectable", Toast.LENGTH_SHORT)
	          .show();
			Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
			v.vibrate(300);
		}
		notifyArmyChange();
	}

//	@Override
//	public void onModelRemoved(SelectionEntry model) {
//		if (model.isSelected()) {
//
//			if (model.getType() == ModelTypeEnum.WARCASTER || model.getType() == ModelTypeEnum.WARLOCK) {
//				SelectedArmyCommander caster = (SelectedArmyCommander) SelectionModelSingleton.getInstance().getSelectedEntryById(model.getId());
//				SelectionModelSingleton.getInstance().removeCaster(caster);
//			}
//			
//			if (model.getType() == ModelTypeEnum.WARJACK) {
//				// this jack may be attached to many casters
//				List<JackCommander> modelsWithThisJack = SelectionModelSingleton.getInstance().warjackDeletionChoices(model.getId());
//				if (modelsWithThisJack.size() > 1) {
//					askWhichToDetachFrom(model, modelsWithThisJack);
//				} else {
//					SelectionModelSingleton.getInstance().removeWarjack(model.getId(), modelsWithThisJack.get(0));
//				}
//			}
//			
//			if (model.getType() == ModelTypeEnum.UNIT) {
//				ArrayList<SelectedUnit> deletableUnits = SelectionModelSingleton.getInstance().unitDeletionChoices(model.getId());
//				if (  deletableUnits.size() > 1) {
//					// choose wich unit to remove
//					askWhichToDelete(deletableUnits);
//				} else {
//					// directly delete the entry
//					SelectionModelSingleton.getInstance().removeUnit(deletableUnits.get(0));
//				}
//			}
//			
//			notifyArmyChange();
//		} else {
//			Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
//			v.vibrate(300);
//		}
//
//	}

	@Override
	public void viewSelectionDetail(SelectionEntry model) {

		SelectionModelSingleton.getInstance().setCurrentlyViewedElement(
				ArmySingleton.getInstance().getArmyElements()
						.get(model.getId()));
		
		viewModelDetail(null);

	}
	
	public void removeViewCardFragment(View v) {
		Log.d("PopulateArmyList","removeViewCardFragment");
		FragmentManager fragmentManager = getSupportFragmentManager();
		FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
		
		if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
			fragmentTransaction.remove(fragmentManager.findFragmentByTag(ViewCardFragment.ID));
		}
		fragmentTransaction.commit();
		
		LinearLayout cardZone = (LinearLayout) findViewById(R.id.card_zone);
		cardZone.setVisibility(View.GONE);
	}
	
	public void viewModelDetailInNewActivity(View v) {
		Log.d("viewModelDetailInNewActivity", "viewModelDetailInNewActivity");
		Intent intent = new Intent(this, ViewCardActivity.class);
		intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
		startActivity(intent);
	}	

	public void askForDismountOption(SelectionSolo dragoon) {
		Intent intent = new Intent(this, ChooseDismountOptionActivity.class);
		intent.putExtra(ChooseDismountOptionActivity.INTENT_SOLO_ID, dragoon.getId());
		startActivityForResult(intent, ChooseDismountOptionActivity.CHOOSE_DISMOUNT_OPTIONS_DIALOG);
	}
	
	public void askForUnitDetails(SelectionUnit unit) {
		Intent intent = new Intent(this, ChooseUnitSizeActivity.class);
		intent.putExtra(ChooseUnitSizeActivity.INTENT_UNIT_ID, unit.getId());
		startActivityForResult(intent, ChooseUnitSizeActivity.CHOOSE_UNIT_OPTIONS_DIALOG);
	}
	
	public void askWhichToDetachFrom(SelectionEntry model, List<JackCommander> jackCommanders) {
		Intent intent = new Intent(this, ChooseDetachActivity.class);
		intent.putExtra(ChooseDetachActivity.INTENT_ELEMENT_ID, jackCommanders.get(0).getId());
		
		ArrayList<JackCommander> jackCommandersSerial = new ArrayList<JackCommander>(); 
		jackCommandersSerial.addAll(jackCommanders);
		intent.putExtra(ChooseDetachActivity.INTENT_FROM_LIST, jackCommandersSerial);
		startActivityForResult(intent, ChooseDetachActivity.CHOOSE_DETACH_DIALOG);
	}

	
	public void askWhichToDelete(ArrayList<SelectedUnit> units) {
		Intent intent = new Intent(this, ChooseDeleteActivity.class);
		intent.putExtra(ChooseDeleteActivity.INTENT_ELEMENT_ID, units.get(0).getId());
		startActivityForResult(intent, ChooseDeleteActivity.CHOOSE_DELETE_DIALOG);
	}

	
	public void askWhoToAttach(SelectionEntry entry) {
		Intent intent = new Intent(this, ChooseAttachActivity.class);
		intent.putExtra(ChooseAttachActivity.INTENT_ELEMENT_ID, entry.getId());
		startActivityForResult(intent, ChooseAttachActivity.CHOOSE_ATTACH_DIALOG);
	}

	public void chooseOptions(View v) {
		
		DialogFragment dialog = new ChooseArmyOptionsDialog();
        dialog.show(getSupportFragmentManager(), "ChooseArmyOptionsDialog");
		
	}
	
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {

		Log.d("PopulateArmyListActivity", "onActivityResult");
		
		if (requestCode == ChooseUnitSizeActivity.CHOOSE_UNIT_OPTIONS_DIALOG) {
			if (resultCode == RESULT_OK) {
				UnitOption result = new UnitOption();

				String modelId = data.getStringExtra(ChooseUnitSizeActivity.INTENT_UNIT_ID);

				boolean minSize = data.getBooleanExtra(ChooseUnitSizeActivity.INTENT_MIN_SIZE, true);

				result.setMinSize(minSize);

				SelectionUnit unit = (SelectionUnit) SelectionModelSingleton.getInstance().getSelectionEntryById(modelId);
				SelectionModelSingleton.getInstance().addUnit(unit, minSize);
				unit.setSelected(true);
				notifyArmyChange();
				
			}
		}
		
		if (requestCode == ChooseDismountOptionActivity.CHOOSE_DISMOUNT_OPTIONS_DIALOG) {
			if (resultCode == RESULT_OK) {

				String modelId = data.getStringExtra(ChooseDismountOptionActivity.INTENT_SOLO_ID);

				boolean dismountOption = data.getBooleanExtra(ChooseDismountOptionActivity.INTENT_DISMOUNT_OPTION, false);

				SelectionSolo solo = (SelectionSolo) SelectionModelSingleton.getInstance().getSelectionEntryById(modelId);
				SelectionModelSingleton.getInstance().addDragoon(solo, dismountOption);
				solo.setSelected(true);
				notifyArmyChange();
				
			}
		}

		if (requestCode == ChooseAttachActivity.CHOOSE_ATTACH_DIALOG) {
			if (resultCode == RESULT_OK) {

				String modelId = data.getStringExtra(ChooseAttachActivity.INTENT_ELEMENT_ID);
				int index = data.getIntExtra(ChooseAttachActivity.INTENT_ELEMENT_NUMBER, 0);

				SelectionEntry entry = SelectionModelSingleton.getInstance().getSelectionEntryById(modelId);
				List<SelectedEntry> modelsToAttach = SelectionModelSingleton.getInstance().modelsToWhichAttach(entry);
				SelectionModelSingleton.getInstance().addAttachedElementTo(entry, modelsToAttach.get(index)); 
				
				notifyArmyChange();
			}
		}

		
//		if (requestCode == ChooseDeleteActivity.CHOOSE_DELETE_DIALOG) {
//			if (resultCode == RESULT_OK) {
//				armySaved = false;
//				notifyArmyChange();
//			}
//		}
//		
//		if (requestCode == ChooseDetachActivity.CHOOSE_DETACH_DIALOG) {
//			if (resultCode == RESULT_OK) {
//				armySaved = false;
//				notifyArmyChange();
//			}
//		}
		
	}

	public void changeArmySettings(int casterCount, int pointCount) {
		SelectionModelSingleton.getInstance().setNbCasters(casterCount);
		SelectionModelSingleton.getInstance().setNbPoints(pointCount);
		notifyArmyChange();
	}
	
//	private void changeSelectionMode(boolean singleClick) {
//		selectionModeSingleClick = singleClick;
//	}
	
	@SuppressLint("SimpleDateFormat")
	@Override
	public void onBackPressed() {
		if (onSelectedArmyZone) {
			// back to selection zone instead of closing
			toSelectionArmy(null);
			return;
		}
		
		if (! SelectionModelSingleton.getInstance().isSaved()) {
			
			SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(this);
			boolean exitSilently = sharedPref.getBoolean(PreferenceConstants.EXIT_SILENTLY, false);

			if (exitSilently) {
				SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd-kk'H'mm");
				String armyFileName = "temp-" + sdf.format(new Date()); 
				
				if (SelectionModelSingleton.getInstance().getSelectedEntries().size() > 0) {
					SelectionModelSingleton.getInstance().setArmyFileName(armyFileName);
					StorageManager.saveArmyList(PopulateArmyListActivity.this.getApplicationContext(), SelectionModelSingleton.getInstance());
					Toast.makeText(getApplicationContext(), "Army saved as " + armyFileName, Toast.LENGTH_SHORT).show();
				}
				
				finish();
			} else {
				AlertDialog.Builder alert = new AlertDialog.Builder(this);

				alert.setTitle("You are about to leave the page");
				alert.setMessage("Your army as not been saved? Changes will be lost. Exit anyway?");

				alert.setPositiveButton("Ok", new DialogInterface.OnClickListener() {
				public void onClick(DialogInterface dialog, int whichButton) {
					PopulateArmyListActivity.this.finish();
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
			
		} else {
			finish();
		}
		
	}

	public void navigateHome() {
		Toast.makeText(getApplicationContext(), "Home pressed", Toast.LENGTH_SHORT).show();
	}

	@Override
	public ArmyElement getArmyElement() {
		return SelectionModelSingleton.getInstance().getCurrentlyViewedElement();
	}

	@Override
	public boolean isCardfullScreen() {
		// card in fragment --> not full screen
		return false;
	}

	@Override
	public boolean isCardDoublePane() {
		// double pane only if : portrait + large screen
		Configuration config = getResources().getConfiguration();
		DisplayMetrics metrics = new DisplayMetrics();
		getWindow().getWindowManager().getDefaultDisplay().getMetrics(metrics);
		if (metrics.widthPixels * metrics.density  > 600 
				&& config.orientation == Configuration.ORIENTATION_PORTRAIT) {
			return true;
		}
		return false;
	}

	@Override
	public boolean useSingleClick() {
		return selectionModeSingleClick;
	}


	@Override
	public void viewModelDetail(View v) {
		FragmentManager fragmentManager = getSupportFragmentManager();

		if (findViewById(R.id.card_zone) != null) {
			// create new fragment
			FragmentTransaction fragmentTransaction = fragmentManager
					.beginTransaction();

			LinearLayout cardZone = (LinearLayout) findViewById(R.id.card_zone);
			cardZone.setVisibility(View.VISIBLE);

			if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
				fragmentTransaction.remove(fragmentManager
						.findFragmentByTag(ViewCardFragment.ID));
			}
			ViewCardFragment viewCardFragment = new ViewCardFragment();
			fragmentTransaction.add(R.id.card_zone, viewCardFragment,
					ViewCardFragment.ID);
			fragmentTransaction.commit();

		} else {

			// open new activity
			Intent intent = new Intent(this, ViewCardActivity.class);
			intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
			startActivity(intent);

		}
	}


}
