package com.schlaf.steam.activities.damages;

import net.simonvt.numberpicker.NumberPicker;
import net.simonvt.numberpicker.NumberPicker.OnValueChangeListener;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.os.Bundle;
import android.util.Log;
import android.view.ContextThemeWrapper;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.battle.BattleListFragment.BattleListInterface;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.MyrmidonDamageGrid;

public class MyrmidonGridDamageFragment extends SherlockDialogFragment implements OnValueChangeListener, DamageChangeObserver, ColumnChangeObserver  {

	private BattleListInterface listener;
	MyrmidonDamageGridView damageGridView;
	MyrmidonDamageGrid grid;

	NumberPicker damageNumberPicker;

	// column selected in view
	int currentColumn = 0;
	
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		Log.d("MyrmidonGridDamageFragment", "onCreateDialog");
		
		grid = (MyrmidonDamageGrid) listener.getCurrentDamageGrid();
		
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Apply damages to " + grid.getModel().getName());
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
		
		// create ContextThemeWrapper from the original Activity Context with the custom theme
		Context context = new ContextThemeWrapper(getActivity(), R.style.WhacTheme);
		// clone the inflater using the ContextThemeWrapper
		LayoutInflater localInflater = inflater.cloneInContext(context);
		// inflate using the cloned inflater, not the passed in default	
		View view = localInflater.inflate(R.layout.damage_dialog_myrmidon_grid_fragment, null);
		

		damageGridView = (MyrmidonDamageGridView) view.findViewById(R.id.damageGridView1);		
		damageGridView.setGrid(grid);
		damageGridView.setEdit(true);
		damageGridView.setCurrentColumn(0);
		damageGridView.registerColumnObserver(this);
		grid.registerObserver(this);
		
		
		damageNumberPicker = (NumberPicker) view.findViewById(R.id.numberPickerDamage);
		damageNumberPicker.setMinValue(0);
		damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
		damageNumberPicker.setOnValueChangedListener(this);
		damageNumberPicker.setWrapSelectorWheel(false);
		damageNumberPicker.setDescendantFocusability(NumberPicker.FOCUS_BLOCK_DESCENDANTS);
		
		view.findViewById(R.id.buttonCancel).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.resetFakeDamages();
				MyrmidonGridDamageFragment.this.dismiss();
			}
		});
		
		view.findViewById(R.id.buttonCommit).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.commitFakeDamages();
				MyrmidonGridDamageFragment.this.dismiss();
			}
		});
		
		view.findViewById(R.id.buttonApply).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				damageNumberPicker.setValue(0);
				damageNumberPicker.setWrapSelectorWheel(false);
				grid.commitFakeDamages();
			}
		});
		
		builder.setView(view);

		// Create the AlertDialog object and return it
		return builder.create(); 
	}
	

	@Override
	public void onAttach(Activity activity) {
		Log.d("MyrmidonGridDamageFragment", "onAttach");
		super.onAttach(activity);
		if (activity instanceof BattleListInterface) {
			listener = (BattleListInterface) activity;
		} else {
			throw new ClassCastException(activity.toString()
					+ " must implement BattleListInterface");
		}
		
		
	}


	@Override
	public void onValueChange(NumberPicker picker, int oldVal, int newVal) {
		Log.d("MyrmidonGridDamageFragment", "onValueChange oldval = " + oldVal + " - newVal = " + newVal);
		if (picker == damageNumberPicker) { 
			if (newVal > oldVal) {
				addDamage(newVal - oldVal);
			} else {
				removeDamage(oldVal - newVal);
			}
			damageNumberPicker.setWrapSelectorWheel(false);
		}
	}
	
    public void addDamage(int i) {
    	grid.applyFakeDamages( damageGridView.getCurrentColumn() , i);
    	damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
    }
    
    public void removeDamage(int i) {
    	grid.applyFakeDamages(damageGridView.getCurrentColumn() , -i);
    	damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
    }


	@Override
	public void onChangeDamageStatus(DamageGrid grid) {
//		if (currentColumn != damageGridView.getCurrentColumn()) {
//			currentColumn = damageGridView.getCurrentColumn();
//			damageNumberPicker.setValue(0);
//			damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
//			damageNumberPicker.setWrapSelectorWheel(false);
//		}
	}
	
	@Override
	public void onChangeColumn(ColumnChangeNotifier notifier) {
		Log.d("MyrmidonGridDamageFragment", "onChangeColumn");
		damageNumberPicker.setValue(0);
		damageNumberPicker.setMaxValue(grid.getDamagePendingStatus().getRemainingPoints());
		damageNumberPicker.setWrapSelectorWheel(false);
	}

}
