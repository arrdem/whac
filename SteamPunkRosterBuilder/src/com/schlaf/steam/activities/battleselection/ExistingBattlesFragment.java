package com.schlaf.steam.activities.battleselection;

import java.util.List;

import android.content.Intent;
import android.os.Bundle;
import android.view.View;
import android.widget.ListView;
import android.widget.Toast;

import com.actionbarsherlock.app.SherlockListFragment;
import com.schlaf.steam.activities.battle.BattleActivity;
import com.schlaf.steam.adapters.BattleSelectionRowAdapter;
import com.schlaf.steam.storage.ArmyListDescriptor;
import com.schlaf.steam.storage.BattleListDescriptor;
import com.schlaf.steam.storage.StorageManager;

public class ExistingBattlesFragment extends SherlockListFragment {

	List<BattleListDescriptor> list;
	BattleSelectionRowAdapter adapter;
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

		list= getData();
	    adapter = new BattleSelectionRowAdapter(getActivity(), list);

	    setListAdapter(adapter);
	    
	}
	
	@Override
	public void onListItemClick(ListView l, View v, int position, long id) {
		
		Toast.makeText(getActivity(), "Battle selected " , Toast.LENGTH_SHORT).show();
		
		// open battle activity
		Intent intent = new Intent(getActivity(), BattleActivity.class);
		intent.putExtra(BattleActivity.INTENT_ARMY, list.get(position).getFilename());
		intent.putExtra(BattleActivity.INTENT_CREATE_BATTLE_FROM_ARMY, false);
		
		startActivity(intent);
		
	}
	
	private List<BattleListDescriptor> getData() {
		return StorageManager.getBattleLists(getActivity());
	}

	public void refresh() {
		list= getData();
		adapter.notifyDataSetInvalidated();
	    adapter = new BattleSelectionRowAdapter(getActivity(), list);
	    setListAdapter(adapter);
	}
	
	public void notifyBattleListDeletion(BattleListDescriptor listDescriptor) {
		adapter.remove(listDescriptor);
		adapter.notifyDataSetChanged();
	}
	
}
