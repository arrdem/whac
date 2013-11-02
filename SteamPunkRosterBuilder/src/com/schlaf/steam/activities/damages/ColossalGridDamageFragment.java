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
import com.schlaf.steam.data.ColossalDamageGrid;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.WarjackDamageGrid;

public class ColossalGridDamageFragment extends SherlockDialogFragment implements OnValueChangeListener, DamageChangeObserver, ColumnChangeObserver {

	private BattleListInterface listener;
	ColossalDamageGrid grid;
	WarjackDamageGridView leftDamageGridView;
	WarjackDamageGridView rightDamageGridView;
	WarjackDamageGrid leftGrid;
	WarjackDamageGrid rightGrid;
	
	int selectedSide = NONE;
	static final int NONE = 0;
	static final int LEFT = 1;
	static final int RIGHT = 2;
	
	
	
	NumberPicker damageNumberPicker;

	// column selected in view
	int currentColumn = 0;
	
	public Dialog onCreateDialog(Bundle savedInstanceState) {
		Log.d("ColossalGridDamageFragment", "onCreateDialog");
		
		grid = (ColossalDamageGrid) listener.getCurrentDamageGrid();
		leftGrid = grid.getLeftGrid();
		rightGrid = grid.getRightGrid();
		
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Apply damages to " + grid.getModel().getName());
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
		
		// create ContextThemeWrapper from the original Activity Context with the custom theme
		Context context = new ContextThemeWrapper(getActivity(), R.style.WhacTheme);
		// clone the inflater using the ContextThemeWrapper
		LayoutInflater localInflater = inflater.cloneInContext(context);
		// inflate using the cloned inflater, not the passed in default	
		View view = localInflater.inflate(R.layout.damage_dialog_colossal_fragment, null);
		

		leftDamageGridView = (WarjackDamageGridView) view.findViewById(R.id.damageGridViewLeft);		
		leftDamageGridView.setGrid((WarjackDamageGrid) leftGrid);
		leftDamageGridView.setEdit(true);
		leftDamageGridView.setCurrentColumn(-1);
		leftDamageGridView.registerColumnObserver(this);
		leftGrid.registerObserver(leftDamageGridView);
		leftGrid.registerObserver(this);
		
		rightDamageGridView = (WarjackDamageGridView) view.findViewById(R.id.damageGridViewRight);		
		rightDamageGridView.setGrid((WarjackDamageGrid) rightGrid);
		rightDamageGridView.setEdit(true);
		rightDamageGridView.setCurrentColumn(-1);
		rightDamageGridView.registerColumnObserver(this);
		rightGrid.registerObserver(rightDamageGridView);
		rightGrid.registerObserver(this);

		
		damageNumberPicker = (NumberPicker) view.findViewById(R.id.numberPickerDamage);
		damageNumberPicker.setOnValueChangedListener(this);
		damageNumberPicker.setDescendantFocusability(NumberPicker.FOCUS_BLOCK_DESCENDANTS);
		selectedSide = NONE;
		updateDamagePicker();
		
		view.findViewById(R.id.buttonCancel).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.resetFakeDamages();
				ColossalGridDamageFragment.this.dismiss();
			}
		});
		
		view.findViewById(R.id.buttonCommit).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.commitFakeDamages();
				ColossalGridDamageFragment.this.dismiss();
			}
		});
		
		view.findViewById(R.id.buttonApply).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				updateDamagePicker();
				grid.commitFakeDamages();
			}
		});
		
		builder.setView(view);

		// Create the AlertDialog object and return it
		return builder.create(); 
	}
	

	@Override
	public void onAttach(Activity activity) {
		Log.d("ColossalGridDamageFragment", "onAttach");
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
		Log.d("ColossalGridDamageFragment", "onValueChange oldval = " + oldVal + " - newVal = " + newVal);
		
		if (picker == damageNumberPicker) { 
			if (newVal > oldVal) {
				addDamage(newVal - oldVal);
			} else {
				removeDamage(oldVal - newVal);
			}
		}
		
	}
	
    public void addDamage(int i) {
    	// Log.d("ColossalGridDamageFragment", "addDamage " + i + " to side" + (selectedSide==LEFT?"left":"right"));
    	if (selectedSide == LEFT) {
    		leftGrid.applyFakeDamages( leftDamageGridView.getCurrentColumn() , i);
    	} else {
    		rightGrid.applyFakeDamages( rightDamageGridView.getCurrentColumn() , i);
    	}
    	// updateDamagePicker();
    }
    
    public void removeDamage(int i) {
    	if (selectedSide == LEFT) {
    		leftGrid.applyFakeDamages( leftDamageGridView.getCurrentColumn() , -i);
    	} else {
    		rightGrid.applyFakeDamages( rightDamageGridView.getCurrentColumn() , -i);
    	}
    	// updateDamagePicker();
    }


	@Override
	public void onChangeDamageStatus(DamageGrid notifyingGrid) {
		// updateDamagePicker();
		
		// propagate damage to colossal grid if message comes from one on L/R grid
		if (notifyingGrid == leftGrid || notifyingGrid == rightGrid) {
			grid.notifyBoxChange();
		} 
		
	}


	@Override
	public void onChangeColumn(ColumnChangeNotifier gridView) {
		Log.d("ColossalGridDamageFragment", "onChangeColumn");
		if (gridView == leftDamageGridView ) {
			rightDamageGridView.setCurrentColumn(-1);
			selectedSide = LEFT;
		} else if (gridView == rightDamageGridView ){
			leftDamageGridView.setCurrentColumn(-1);
			selectedSide = RIGHT;
		} else {
			selectedSide = NONE; // WTF?
		}
		damageNumberPicker.setValue(0);
		updateDamagePicker();
	}
	
	private void updateDamagePicker() {
		
		damageNumberPicker.setMinValue(0);
		if (selectedSide == LEFT) {
			damageNumberPicker.setMaxValue(((WarjackDamageGrid) leftGrid).getDamagePendingStatus().getRemainingPoints());
		} else {
			damageNumberPicker.setMaxValue(((WarjackDamageGrid) rightGrid).getDamagePendingStatus().getRemainingPoints());
		}
		damageNumberPicker.setWrapSelectorWheel(false);
	}

}
