package com.schlaf.steam.activities.battle;

import android.app.Activity;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemLongClickListener;
import android.widget.ListView;

import com.actionbarsherlock.app.SherlockFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.PreferenceConstants;
import com.schlaf.steam.data.DamageGrid;

public abstract class BattleListFragment extends SherlockFragment {

	public static final String ID = "battleListFragment";
	
	BattleListAdapter battleListAdapter;
	
	public interface BattleListInterface {
		public BattleList getArmyList();
		
		public void viewBattleEntryDetail(BattleEntry model);
		
		public void showDamageDialog(MultiPVModel model);
		
		public DamageGrid getCurrentDamageGrid();
		
		public MultiPVModel getCurrentModel();
		
	}
	
	protected abstract int getPlayerNumber();
	
	
	BattleListInterface battleManager;
	
	@Override
	public void onAttach(Activity activity) {
		Log.d("BattleListFragment", "onAttach");
		super.onAttach(activity);
		if (activity instanceof BattleListInterface) {
			battleManager = (BattleListInterface) activity;
		} else {
			throw new UnsupportedOperationException(activity.toString()
					+ " must implement BattleListInterface");
		}
	}

	public void refreshAllList() {
		battleListAdapter.notifyDataSetInvalidated();
		battleListAdapter = new BattleListAdapter(getActivity(), getPlayerNumber());
		ListView list = (ListView) getView().findViewById(R.id.listView1);
		list.setAdapter(battleListAdapter);
		
		SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(getActivity());
		boolean selectionModeSingleClick = sharedPref.getBoolean(PreferenceConstants.ACCESS_SIMPLE_CLICK, PreferenceConstants.ACCESS_SIMPLE_CLICK_DEFAULT);
		
		attachClickMethod(list, selectionModeSingleClick);

	}
	
	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {

		Log.d("BattleListFragment", "onCreateView");
		
		View view = inflater.inflate(R.layout.battle_list_fragment,
				container, false);
		return view;
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		Log.d("BattleListFragment", "onActivityCreated");
		super.onActivityCreated(savedInstanceState);
		
		// gestion de la liste d'armée
		ListView list = (ListView) getView().findViewById(R.id.listView1);
		
		battleListAdapter = new BattleListAdapter(getActivity(), getPlayerNumber());
		list.setAdapter(battleListAdapter);
		
		SharedPreferences sharedPref = PreferenceManager.getDefaultSharedPreferences(getActivity());
		boolean selectionModeSingleClick = sharedPref.getBoolean(PreferenceConstants.ACCESS_SIMPLE_CLICK, PreferenceConstants.ACCESS_SIMPLE_CLICK_DEFAULT);
		
		
		attachClickMethod(list, selectionModeSingleClick);
	}

	private void attachClickMethod(ListView list,
			boolean selectionModeSingleClick) {
		if (selectionModeSingleClick) {
			list.setOnItemClickListener(new OnItemClickListener(){

				@Override
				public void onItemClick(AdapterView<?> parent, View view,
						int position, long id) {
					BattleEntry selectedEntry = (BattleEntry) battleListAdapter.getItem(position);
					
					if (selectedEntry != null) {
						battleManager.viewBattleEntryDetail(selectedEntry);
					}
					
				}
			});			
		} else {
			list.setOnItemLongClickListener(new OnItemLongClickListener() {

				@Override
				public boolean onItemLongClick(AdapterView<?> parent, View view,
						int position, long id) {
					// TODO Auto-generated method stub

					BattleEntry selectedEntry = (BattleEntry) battleListAdapter.getItem(position);
					
					if (selectedEntry != null) {
						battleManager.viewBattleEntryDetail(selectedEntry);
					}
					
					return true;
					
				}
			});
		}
	}

	
	
}
