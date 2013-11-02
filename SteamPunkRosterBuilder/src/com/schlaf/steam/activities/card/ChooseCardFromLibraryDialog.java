/**
 * 
 */
package com.schlaf.steam.activities.card;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

import android.app.Activity;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;
import android.view.ViewGroup;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.AdapterView.OnItemSelectedListener;
import android.widget.ArrayAdapter;
import android.widget.ListView;
import android.widget.Spinner;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.card.ViewCardFragment.ViewCardActivityInterface;
import com.schlaf.steam.activities.selectlist.SelectionModelSingleton;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Faction;
import com.schlaf.steam.data.ModelTypeEnum;

/**
 * @author S0085289
 * 
 */
public class ChooseCardFromLibraryDialog extends SherlockDialogFragment implements OnItemSelectedListener, OnClickListener, OnItemClickListener {

	public static final String ID = "ChooseCardFromLibraryDialog";
	
	Spinner factionSpinner;
	Spinner entryTypeSpinner;
	ListView entriesListView;
	
	private ViewCardActivityInterface mListener;
	
    // Override the Fragment.onAttach() method to instantiate the NoticeDialogListener
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        // Verify that the host activity implements the callback interface
        try {
            // Instantiate the NoticeDialogListener so we can send events to the host
            mListener = (ViewCardActivityInterface) activity;
        } catch (ClassCastException e) {
            // The activity doesn't implement the interface, throw exception
            throw new ClassCastException(activity.toString()
                    + " must implement ViewCardActivityInterface");
        }
    }

	@Override
	public void onItemSelected(AdapterView<?> parent, View view, int position,
			long id) {
		
		if (parent.getId() == factionSpinner.getId()) {
			if (factionSpinner.getSelectedItemPosition() != Spinner.INVALID_POSITION) {
				// change faction, refilter entries types
				CardLibrarySingleton.getInstance().setFaction((Faction)factionSpinner.getSelectedItem());
				List<ModelTypeEnum> types = CardLibrarySingleton.getInstance().getNonEmptyEntryType();
				
				ArrayAdapter<ModelTypeEnum> adapterEntryType = new ArrayAdapter<ModelTypeEnum>(getActivity(), android.R.layout.simple_spinner_item, android.R.id.text1, types);
				adapterEntryType.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
				entryTypeSpinner.setAdapter(adapterEntryType);
				
				// reselect same type if possible
				if (CardLibrarySingleton.getInstance().getEntryType() == null) {
					CardLibrarySingleton.getInstance().setEntryType(types.get(0));	
				} else {
					int selected = types.indexOf(CardLibrarySingleton.getInstance().getEntryType());
					if (selected == -1) {
						// if type has disappeared, select first by default...
						selected = 0;
					}
					entryTypeSpinner.setSelection(selected, false);
				}
				
			}
		}
		
		if (parent.getId() == factionSpinner.getId() || parent.getId() == entryTypeSpinner.getId() ) {
			
			if (factionSpinner.getSelectedItemPosition() != Spinner.INVALID_POSITION &&
					entryTypeSpinner.getSelectedItemPosition() != Spinner.INVALID_POSITION) {
				
				CardLibrarySingleton.getInstance().setFaction((Faction)factionSpinner.getSelectedItem());
				CardLibrarySingleton.getInstance().setEntryType((ModelTypeEnum)entryTypeSpinner.getSelectedItem());
				
				ArrayAdapter<LabelValueBean> adapterEntry = 
						new ArrayAdapter<LabelValueBean>(getActivity(), android.R.layout.simple_list_item_1, android.R.id.text1, CardLibrarySingleton.getInstance().getEntries());
				entriesListView.setAdapter(adapterEntry);
			}
		} 
		
	}



	@Override
	public void onNothingSelected(AdapterView<?> parent) {
		// TODO Auto-generated method stub
	}
	

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		View view = createView(inflater);
		
		if (getShowsDialog()) {
			getDialog().setTitle("Choose card");
		}
		
		return view;
	}



	private View createView(LayoutInflater inflater) {
		View view = inflater.inflate(R.layout.choose_card_options, null);
		
				
		factionSpinner = (Spinner) view.findViewById(R.id.icsSpinnerFaction);
		
		HashMap<String, Faction> factions = ArmySingleton.getInstance().getFactions();
		List<Faction> factionsList= new ArrayList<Faction>();
		factionsList.addAll(factions.values());
		Collections.sort(factionsList);
		
		ArrayAdapter<Faction> adapter = new ArrayAdapter<Faction>(getActivity(), android.R.layout.simple_spinner_item, android.R.id.text1, factionsList);
		// Specify the layout to use when the list of choices appears
		adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		factionSpinner.setAdapter(adapter);
		

		if (CardLibrarySingleton.getInstance().getFaction() == null) {
			CardLibrarySingleton.getInstance().setFaction(factionsList.get(0));	
		} else {
			int selected = factionsList.indexOf(CardLibrarySingleton.getInstance().getFaction());
			factionSpinner.setSelection(selected, false);
		}

		
		entryTypeSpinner = (Spinner) view.findViewById(R.id.icsSpinnerEntryType);
		
		List<ModelTypeEnum> entryTypeList = CardLibrarySingleton.getInstance().getNonEmptyEntryType();
		ArrayAdapter<ModelTypeEnum> adapterEntryType = new ArrayAdapter<ModelTypeEnum>(getActivity(), android.R.layout.simple_spinner_item, android.R.id.text1, entryTypeList);
		adapterEntryType.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item);
		entryTypeSpinner.setAdapter(adapterEntryType);
		
		entriesListView = (ListView) view.findViewById(R.id.listView1);
				
		factionSpinner.setOnItemSelectedListener(this);
		entryTypeSpinner.setOnItemSelectedListener(this);
		entriesListView.setOnItemClickListener(this);
		
		// reselect same type if possible
		if (CardLibrarySingleton.getInstance().getEntryType() == null) {
			CardLibrarySingleton.getInstance().setEntryType(entryTypeList.get(0));	
		} else {
			int selected = entryTypeList.indexOf(CardLibrarySingleton.getInstance().getEntryType());
			if (selected == -1) {
				// if type has disappeared, select first by default...
				selected = 0;
			}
			entryTypeSpinner.setSelection(selected, false);
		}

		
		return view;
	}



	@Override
	public void onClick(View v) {
		

	}



	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position,
			long id) {
		if (parent.getId() == entriesListView.getId()) {
			if (entriesListView.getItemAtPosition(position) != null) {
				String entryId = ((LabelValueBean) entriesListView.getItemAtPosition(position)).getId();
				SelectionModelSingleton.getInstance().setCurrentlyViewedElement(ArmySingleton.getInstance().getArmyElement(entryId));
				mListener.viewModelDetail(null);
				
				if (getShowsDialog()) {
					dismiss();
				}
			}
		}
	}

	@Override
	public void onActivityCreated(Bundle arg0) {
		// TODO Auto-generated method stub
		super.onActivityCreated(arg0);
	}


}
