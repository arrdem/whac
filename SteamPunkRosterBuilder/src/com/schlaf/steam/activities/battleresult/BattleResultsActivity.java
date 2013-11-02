package com.schlaf.steam.activities.battleresult;

import android.app.AlertDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.actionbarsherlock.view.Menu;
import com.actionbarsherlock.view.MenuItem;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.battle.BattleResult;
import com.schlaf.steam.activities.battleresult.BattleResultDetailFragment.ViewBattleResultActivityInterface;
import com.schlaf.steam.activities.battleresult.BattleResultsListFragment.ChooseBattleResultListener;
import com.schlaf.steam.storage.StorageManager;

public class BattleResultsActivity extends SherlockFragmentActivity implements ChooseBattleResultListener, ViewBattleResultActivityInterface {

	private static final String TAG = "BattleResultsActivity"; 
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		Log.d("BattleActivity", "onCreate");
	
		super.onCreate(savedInstanceState);
		setContentView(R.layout.battleresults_fragmented);
		
		getSupportActionBar().setTitle("Battle results");
		
		// mask detail zone at startup
		if (findViewById(R.id.resultDetail_zone) != null) {
			findViewById(R.id.resultDetail_zone).setVisibility(View.GONE);
		}
		
	}

	   /**
     * {@inheritDoc}
     */
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        super.onCreateOptionsMenu(menu);
        getSupportMenuInflater().inflate(R.menu.stats_menu, menu);
        // getSupportActionBar().
        
        if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.HONEYCOMB) {
        	menu.findItem(R.id.menu_more).setVisible(false);
        }
        
        return true;
    }
    
	@Override
	public boolean onOptionsItemSelected(MenuItem item) {
	    // Handle item selection
		switch (item.getItemId()) {
			case R.id.menu_sort_date:
				sortByDate();
				return true;
	        case R.id.menu_sort_player:
	        	sortByPlayer();
	            return true;
	        case R.id.menu_sort_winner:
	        	sortByWin();
	            return true;
	        case R.id.menu_export_stats:
	        	exportStats();
	            return true;
	        case R.id.menu_export_by_mail:
	            exportByMail();
	            return true;
	        case R.id.menu_more:
	            openOptionsMenu();
	            return true;
	        default:
	            return super.onOptionsItemSelected(item);
	    }
	}	
    
	   @Override
	    public void openOptionsMenu() {
	        if (!getSherlock().dispatchOpenOptionsMenu()) {
	            super.openOptionsMenu();
	        }
	    }
    
	private void exportStats() {
		StorageManager.exportStats(getApplicationContext());
		Toast.makeText(this, "battle stats exported on SD card", Toast.LENGTH_SHORT).show();
	}
	
	private void exportByMail() {
		
		String strFile = StorageManager.exportStats(getApplicationContext());
		
		final Intent emailIntent = new Intent(android.content.Intent.ACTION_SEND);
        
        emailIntent.setType("plain/text");
        emailIntent.putExtra(android.content.Intent.EXTRA_EMAIL, new String[]{ "unknown_recipient@mail.com" });
        emailIntent.putExtra(android.content.Intent.EXTRA_SUBJECT, "WHAC battle results export file");
        emailIntent.putExtra(Intent.EXTRA_STREAM, Uri.parse("file://" + strFile));
        emailIntent.putExtra(android.content.Intent.EXTRA_TEXT, "this is the export of your battle results");
        startActivity(Intent.createChooser(emailIntent, "Send mail..."));
		
	}
	
	private void sortByDate() {
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(BattleResultsListFragment.ID) != null) {
			BattleResultsListFragment listFragment = (BattleResultsListFragment) fragmentManager.findFragmentByTag(BattleResultsListFragment.ID);
			listFragment.sortByDate();
		}
		
	}

	private void sortByWin() {
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(BattleResultsListFragment.ID) != null) {
			BattleResultsListFragment listFragment = (BattleResultsListFragment) fragmentManager.findFragmentByTag(BattleResultsListFragment.ID);
			listFragment.sortByWin();
		}
		
	}
	
	private void sortByPlayer() {
		FragmentManager fragmentManager = getSupportFragmentManager();
		if (fragmentManager.findFragmentByTag(BattleResultsListFragment.ID) != null) {
			BattleResultsListFragment listFragment = (BattleResultsListFragment) fragmentManager.findFragmentByTag(BattleResultsListFragment.ID);
			listFragment.sortByPlayer();
		}
		
	}

	
	@Override
	public void viewResultDetail(BattleResult result) {
		Log.d(TAG, "viewResultDetail");

		FragmentManager fragmentManager = getSupportFragmentManager();
		
		BattleResultSingleton.getInstance().setCurrentBattleResult(result);
		

		if (findViewById(R.id.resultDetail_zone) != null) {
			// create new fragment
			FragmentTransaction fragmentTransaction = fragmentManager
					.beginTransaction();

			FrameLayout cardZone = (FrameLayout) findViewById(R.id.resultDetail_zone);
			cardZone.setVisibility(View.VISIBLE);

			if (fragmentManager.findFragmentByTag(BattleResultDetailFragment.ID) != null) {
				fragmentTransaction.remove(fragmentManager
						.findFragmentByTag(BattleResultDetailFragment.ID));
			}
			BattleResultDetailFragment resultDetailFragment = new BattleResultDetailFragment();
			fragmentTransaction.add(R.id.resultDetail_zone, resultDetailFragment,
					BattleResultDetailFragment.ID);
			fragmentTransaction.commit();

		} else {

			// open new activity
			viewBattleResultInNewActivity(null);

		}

	}


	@Override
	public BattleResult getBattleResult() {
		return BattleResultSingleton.getInstance().getCurrentBattleResult();
	}

	public void deleteBattleResult(final BattleResult result) {
		
	  	// 1. Instantiate an AlertDialog.Builder with its constructor
    	AlertDialog.Builder builder = new AlertDialog.Builder(this);

    	// 2. Chain together various setter methods to set the dialog characteristics
    	builder.setMessage("you are about to delete the battle result : " + result.getArmyName());
    	builder.setTitle("delete result?");

    	
    	builder.setPositiveButton(R.string.delete, new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int id) {
            	
//            	if (result.equals(currentBR)) {
//                	android.support.v4.app.FragmentManager fragmentManager =   getSupportFragmentManager();
//                	FragmentTransaction fragmentTransaction = fragmentManager
//        					.beginTransaction();
//                	BattleResultDetailFragment detailFragment = (BattleResultDetailFragment) fragmentManager.findFragmentByTag(BattleResultDetailFragment.ID);
//                	if (detailFragment != null) {
//	            		fragmentTransaction.remove(detailFragment);
//	            		fragmentTransaction.commit();
//                	}
//            	}
            	
                // User clicked OK button
            	if (StorageManager.deleteBattleResult(getApplicationContext(), result.getArmyName())) {
                	// notify fragment...
                	android.support.v4.app.FragmentManager fm =   getSupportFragmentManager();
                	BattleResultsListFragment listFragment = (BattleResultsListFragment) fm.findFragmentByTag(BattleResultsListFragment.ID);
                	listFragment.notifyResultDeletion(result);
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
	public void viewBattleResultInNewActivity(View v) {
		Intent intent = new Intent(this, ViewBattleResultActivity.class);
		startActivity(intent);
	}

	@Override
	public void onBackPressed() {
		
		FragmentManager fragmentManager = getSupportFragmentManager();
		
		if (findViewById(R.id.resultDetail_zone) != null) {
			// create new fragment
			FragmentTransaction fragmentTransaction = fragmentManager
					.beginTransaction();


			if (fragmentManager.findFragmentByTag(BattleResultDetailFragment.ID) != null) {
				fragmentTransaction.remove(fragmentManager
						.findFragmentByTag(BattleResultDetailFragment.ID));
				
				FrameLayout detailZone = (FrameLayout) findViewById(R.id.resultDetail_zone);
				detailZone.setVisibility(View.GONE);
			
				fragmentTransaction.commit();
			} else {
				BattleResultsActivity.this.finish();
			}
		} else {
			BattleResultsActivity.this.finish();
		}
		
	}
	
	
	
}