package com.schlaf.steam.activities.damages;

import net.simonvt.numberpicker.NumberPicker;
import net.simonvt.numberpicker.NumberPicker.OnValueChangeListener;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.battle.BattleListFragment.BattleListInterface;
import com.schlaf.steam.data.DamageGrid;

public class SingleLineDamageFragment extends SherlockDialogFragment implements OnValueChangeListener, DamageChangeObserver {

	private BattleListInterface listener;
	DamageGrid grid;
	
	NumberPicker damageNumberPicker;

	public Dialog onCreateDialog(Bundle savedInstanceState) {
		Log.d("SingleLineDamageFragment", "onCreateDialog");
		grid = listener.getCurrentDamageGrid();
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Apply damages to " + listener.getCurrentModel().getLabel());
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
		
		View view = inflater.inflate(R.layout.damage_dialog_line_fragment, null);
		
		damageNumberPicker = (NumberPicker) view.findViewById(R.id.numberPickerDamage);
		
		
		damageNumberPicker.setMinValue(0); // - grid.getDamageStatus().getDamagedPoints());
		damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
		damageNumberPicker.setOnValueChangedListener(this);
		damageNumberPicker.setWrapSelectorWheel(false);
		damageNumberPicker.setDescendantFocusability(NumberPicker.FOCUS_BLOCK_DESCENDANTS);
		
		// DamageButtonView damageButton = (DamageButtonView) view.findViewById(R.id.damageButton1);
		
		
		// cancel
		view.findViewById(R.id.buttonCancel).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.resetFakeDamages();
				SingleLineDamageFragment.this.dismiss();
			}
		});
		
		// commit
		view.findViewById(R.id.buttonCommit).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.commitFakeDamages();
				SingleLineDamageFragment.this.dismiss();
			}
		});
		
		// apply
		view.findViewById(R.id.buttonApply).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				damageNumberPicker.setValue(0);
				damageNumberPicker.setWrapSelectorWheel(false);
				grid.commitFakeDamages();
			}
		});
		
		//damageButton.setAttachedGrid( grid);

		DamageLineView damageLineView = (DamageLineView) view.findViewById(R.id.damageLineView1);		
		damageLineView.setDamageLine((ModelDamageLine) grid);
		damageLineView.setEdit(true);
		
		grid.registerObserver(this);
		
		builder.setView(view);
		// Create the AlertDialog object and return it
		return builder.create();
	}
	


	@Override
	public void onAttach(Activity activity) {
		Log.d("SingleLineDamageFragment", "onAttach");
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
		Log.d("AltGridDamage", "onValueChange oldval = " + oldVal + " - newVal = " + newVal);
		
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
    	grid.applyFakeDamages(i);
    }
    
    public void removeDamage(int i) {
    	grid.applyFakeDamages(-i);
    }



	@Override
	public void onChangeDamageStatus(DamageGrid grid) {
		// update status of number picker depending on damage grid status
		damageNumberPicker.setMinValue(0);
		damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
	}
	
}
