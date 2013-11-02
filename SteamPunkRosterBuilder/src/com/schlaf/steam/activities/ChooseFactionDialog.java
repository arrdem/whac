/**
 * 
 */
package com.schlaf.steam.activities;

import java.util.Arrays;
import java.util.HashMap;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.ListView;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.adapters.FactionRowAdapter;
import com.schlaf.steam.data.ArmySingleton;
import com.schlaf.steam.data.Faction;

/**
 * @author S0085289
 * 
 */
public class ChooseFactionDialog extends SherlockDialogFragment implements OnItemClickListener {

	public interface ChangeFactionListener {
		public void onChangeFaction(Faction newFaction);
	}
	
	private ChangeFactionListener mListener;
	
	private ListView listView;
	
    // Override the Fragment.onAttach() method to instantiate the NoticeDialogListener
    @Override
    public void onAttach(Activity activity) {
        super.onAttach(activity);
        // Verify that the host activity implements the callback interface
        try {
            // Instantiate the NoticeDialogListener so we can send events to the host
            mListener = (ChangeFactionListener) activity;
        } catch (ClassCastException e) {
            // The activity doesn't implement the interface, throw exception
            throw new ClassCastException(activity.toString()
                    + " must implement ChangeFactionListener");
        }
    }
    
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Choose faction");
		
		builder.setNegativeButton("Cancel",
				new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int id) {
						// User cancelled the dialog
					}
				});
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
	    // Inflate and set the layout for the dialog
	    // Pass null as the parent view because its going in the dialog layout
	    
		// Create the AlertDialog object and return it
	    View view = inflater.inflate(R.layout.choose_faction, null);
	    
	    
	    listView = (ListView) view.findViewById(R.id.listView1);		
		FactionRowAdapter adapter = new FactionRowAdapter(getActivity(), getData());
		listView.setAdapter(adapter);
		listView.setOnItemClickListener(this);

	    builder.setView(view);
		return builder.create();
	}
	
	/** Called when the activity is first created. */
	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		
		// l'affichage de chaque ligne est d�di�e par un adapteur sp�cifique
	}

	/**
	 * renvoie la liste des factions disponibles pour afficher dans la liste
	 * @return Faction[]
	 */
	protected Faction[] getData() {
		
		HashMap<String, Faction> factions = ArmySingleton.getInstance().getFactions();
		Faction[] factionsArray = new Faction[factions.entrySet().size()];


		// ArrayList<Factions> 
		factions.values().toArray(factionsArray);
		
		Arrays.sort(factionsArray); // native order as in Faction.Names
		
		return factionsArray;
	}

	@Override
	public void onItemClick(AdapterView<?> parent, View view, int position,
			long id) {
		Faction f = (Faction) listView.getItemAtPosition(position);
		mListener.onChangeFaction(f);
		dismiss();
	}

}
