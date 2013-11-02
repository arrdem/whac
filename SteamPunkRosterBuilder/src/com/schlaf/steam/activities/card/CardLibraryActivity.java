package com.schlaf.steam.activities.card;

import android.content.Intent;
import android.content.res.Configuration;
import android.os.Bundle;
import android.support.v4.app.FragmentManager;
import android.support.v4.app.FragmentTransaction;
import android.util.DisplayMetrics;
import android.util.Log;
import android.view.View;
import android.widget.FrameLayout;

import com.actionbarsherlock.app.SherlockFragmentActivity;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.card.ViewCardFragment.ViewCardActivityInterface;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.data.ArmyElement;

public class CardLibraryActivity extends SherlockFragmentActivity implements ViewCardActivityInterface {
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		Log.d("CardLibraryActivity", "onCreate" );
		super.onCreate(savedInstanceState);

		setContentView(R.layout.cardlibrary_fragmented);

		FragmentManager fragmentManager = getSupportFragmentManager();

		getSupportActionBar().setHomeButtonEnabled(true);
		getSupportActionBar().setTitle("Card library");
		
		if (findViewById(R.id.choose_card_zone) != null) {
			FragmentTransaction fragmentTransaction = fragmentManager
					.beginTransaction();

			FrameLayout chooseCardZone = (FrameLayout) findViewById(R.id.choose_card_zone);
			chooseCardZone.setVisibility(View.VISIBLE);

			if (fragmentManager.findFragmentByTag(ChooseCardFromLibraryDialog.ID) != null) {
				fragmentTransaction.remove(fragmentManager
						.findFragmentByTag(ChooseCardFromLibraryDialog.ID));
			}
			ChooseCardFromLibraryDialog chooseCardFragment = new ChooseCardFromLibraryDialog();
			chooseCardFragment.setShowsDialog(false);
			fragmentTransaction.add(R.id.choose_card_zone, chooseCardFragment,
					ChooseCardFromLibraryDialog.ID);
			fragmentTransaction.commit();

		}
		
		// don't add viewcard fragment at startup!
		
//		if (findViewById(R.id.card_zone) != null) {
//			// create new fragment
//			FragmentTransaction fragmentTransaction = fragmentManager
//					.beginTransaction();
//
//			FrameLayout cardZone = (FrameLayout) findViewById(R.id.card_zone);
//			cardZone.setVisibility(View.VISIBLE);
//
//			if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
//				fragmentTransaction.remove(fragmentManager
//						.findFragmentByTag(ViewCardFragment.ID));
//			}
//			ViewCardFragment viewCardFragment = new ViewCardFragment();
//			fragmentTransaction.add(R.id.card_zone, viewCardFragment,
//					ViewCardFragment.ID);
//			fragmentTransaction.commit();
//		}
		
	}

	@Override
	public ArmyElement getArmyElement() {
		return SelectionModelSingleton.getInstance().getCurrentlyViewedElement();
	}

	@Override
	public boolean isCardfullScreen() {
		// TODO Auto-generated method stub
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
		if (metrics.widthPixels * metrics.density  >= 1024 
				&& config.orientation == Configuration.ORIENTATION_LANDSCAPE) {
			return true;
		}

		return false;	}

	@Override
	public void viewModelDetailInNewActivity(View v) {
		Intent intent = new Intent(this, ViewCardActivity.class);
		intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
		startActivity(intent);
	}

	@Override
	public boolean useSingleClick() {
		// TODO Auto-generated method stub
		return false;
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

		} else {

			// open new activity
			Intent intent = new Intent(this, ViewCardActivity.class);
			intent.putExtra(ViewCardActivity.MODEL_ID, getArmyElement().getId());
			startActivity(intent);

		}
	}
	
	
	public void removeViewCardFragment(View v) {
		Log.d("CardLibraryActivity","removeViewCardFragment");
		FragmentManager fragmentManager = getSupportFragmentManager();
		FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
		
		if (fragmentManager.findFragmentByTag(ViewCardFragment.ID) != null) {
			fragmentTransaction.remove(fragmentManager.findFragmentByTag(ViewCardFragment.ID));
		}
		fragmentTransaction.commit();
		
		View cardZone = findViewById(R.id.card_zone);
		cardZone.setVisibility(View.GONE);
	}
	
}
