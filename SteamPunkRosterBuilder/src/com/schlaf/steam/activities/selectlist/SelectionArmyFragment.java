package com.schlaf.steam.activities.selectlist;

import android.app.Activity;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.ExpandableListView;

import com.actionbarsherlock.app.SherlockFragment;
import com.schlaf.steam.R;

public class SelectionArmyFragment extends SherlockFragment {

	public static final String ID = "SelectionArmyFragment";
	
	/** adapteur de la liste de sélection */
	ListSelectionAdapter selectionAdapter;

	ArmySelectionChangeListener listener;
	
	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		
		Log.d("SelectionArmyFragment", "SelectionArmyFragment.onCreateView");
		
		View view = inflater.inflate(R.layout.army_selection_fragment,
				container, false);


		return view;
	}

	@Override
	public void onAttach(Activity activity) {
		Log.d("SelectionArmyFragment", "SelectionArmyFragment.onAttach");
		super.onAttach(activity);
		if (activity instanceof ArmySelectionChangeListener) {
			listener = (ArmySelectionChangeListener) activity;
		} else {
			throw new UnsupportedOperationException(activity.toString()
					+ " must implemenet ArmySelectionChangeListener");
		}
	}
	
	


	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		// TODO Auto-generated method stub
		super.onActivityCreated(savedInstanceState);
		// gestion de la liste sélectionnable
		ExpandableListView selectionList = (ExpandableListView) getView()
				.findViewById(R.id.army_list_selection);
		selectionAdapter = new ListSelectionAdapter(getActivity());
		selectionList.setAdapter(selectionAdapter);
		// first verification on FA
		selectionAdapter.notifyDataSetChanged();
		
	}
	
	public void notifyDataSetChanged() {
		selectionAdapter.notifyDataSetChanged();
	}
	
	/**
	 * collapse all selection groups
	 */
	public void collapseAll() {
		int count = selectionAdapter.getGroupCount();
		ExpandableListView selectionList = (ExpandableListView) getView()
				.findViewById(R.id.army_list_selection);

		for (int i = 0; i < count; i++) {
			selectionList.collapseGroup(i);
		}
	}

}
