package com.schlaf.steam.activities.battleselection;

import java.util.List;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.ListView;

import com.actionbarsherlock.app.SherlockListFragment;
import com.schlaf.steam.activities.ChooseArmyListDialog.ChooseArmyListener;
import com.schlaf.steam.adapters.ArmyListRowAdapter;
import com.schlaf.steam.storage.ArmyListDescriptor;
import com.schlaf.steam.storage.StorageManager;

public class ExistingArmiesFragment extends SherlockListFragment {

	private List<ArmyListDescriptor> lists;
	ArmyListRowAdapter adapter;
	
	ChooseArmyListener listener; // parent activity
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);

	    lists = StorageManager.getArmyLists(getActivity());
	    
	    adapter = new ArmyListRowAdapter(getActivity(), lists);

	    setListAdapter(adapter);
	    
	}
	
	@Override
	public void onListItemClick(ListView l, View v, int position, long id) {
		listener.onArmyListSelected(lists.get(position));
	}

	@Override
	public void onAttach(Activity activity) {
		// TODO Auto-generated method stub
		super.onAttach(activity);
		
		Log.d("ExistingArmiesFragment", "onAttach");
		super.onAttach(activity);
		if (activity instanceof ChooseArmyListener) {
			listener = (ChooseArmyListener) activity;
		} else {
			throw new UnsupportedOperationException(activity.toString()
					+ " must implemenet ChooseArmyListener");
		}
	}
	
	public void notifyArmyListDeletion(ArmyListDescriptor listDescriptor) {
		adapter.remove(listDescriptor);
		adapter.notifyDataSetChanged();
	}

}
