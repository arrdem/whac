package com.schlaf.steam.activities.damages;

import java.util.ArrayList;

import net.simonvt.numberpicker.NumberPicker;
import net.simonvt.numberpicker.NumberPicker.OnValueChangeListener;
import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.DialogInterface;
import android.os.Bundle;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.View.OnClickListener;

import com.actionbarsherlock.app.SherlockDialogFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.battle.BattleListFragment.BattleListInterface;
import com.schlaf.steam.activities.battle.MultiPVUnit;
import com.schlaf.steam.data.DamageBox;
import com.schlaf.steam.data.DamageGrid;
import com.schlaf.steam.data.MultiPVUnitGrid;

public class MultiPVUnitDamageFragment extends SherlockDialogFragment implements OnValueChangeListener, DamageChangeObserver {

	private BattleListInterface listener;
	MultiPVUnitGrid grid;
	DamageUnitView unitDamageView;
	MultiPVUnit unit;
	
	// NumberPicker modelNumberPicker;
	NumberPicker damageNumberPicker;
	private int selectedModelNumber = 0;

	public Dialog onCreateDialog(Bundle savedInstanceState) {
		Log.d("SingleLineDamageFragment", "onCreateDialog");
		grid = (MultiPVUnitGrid) listener.getCurrentDamageGrid();
		
		unit= (MultiPVUnit) listener.getCurrentModel();
		
		// Use the Builder class for convenient dialog construction
		AlertDialog.Builder builder = new AlertDialog.Builder(getActivity());
		builder.setMessage("Apply damages to " + listener.getCurrentModel().getLabel());
		
		LayoutInflater inflater = getActivity().getLayoutInflater();
		
		View view = inflater.inflate(R.layout.damage_dialog_unit_fragment, null);

//		modelNumberPicker = (NumberPicker) view.findViewById(R.id.numberPickerModel);
//		String[] displayedValues = new String[grid.getDamageLines().size()];
//		int i = 0;
//		for (SingleDamageLineEntry subModel: unit.getModels()) {
//			displayedValues[i] = subModel.getLabel();
//			i++;
//		}
//		modelNumberPicker.setDisplayedValues(displayedValues);
//		modelNumberPicker.setMinValue(0);
//		modelNumberPicker.setMaxValue(displayedValues.length - 1);
//		modelNumberPicker.setOnValueChangedListener(this);
//		modelNumberPicker.invalidate();
		
		damageNumberPicker = (NumberPicker) view.findViewById(R.id.numberPickerDamage);
		damageNumberPicker.setMinValue(0); // - grid.getDamageStatus().getDamagedPoints());
		damageNumberPicker.setMaxValue(10);
		// damageNumberPicker.setMaxValue(grid.getDamageStatus().getRemainingPoints());
		damageNumberPicker.setOnValueChangedListener(this);
		damageNumberPicker.setWrapSelectorWheel(false);
		damageNumberPicker.setDescendantFocusability(NumberPicker.FOCUS_BLOCK_DESCENDANTS);
		
		
		// cancel
		view.findViewById(R.id.buttonCancel).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.resetFakeDamages();
				MultiPVUnitDamageFragment.this.dismiss();
			}
		});
		
		// commit
		view.findViewById(R.id.buttonCommit).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				grid.commitFakeDamages();
				MultiPVUnitDamageFragment.this.dismiss();
			}
		});
		
		// apply
		view.findViewById(R.id.buttonApply).setOnClickListener(new OnClickListener() {
			@Override
			public void onClick(View v) {
				damageNumberPicker.setValue(0);
				damageNumberPicker.setWrapSelectorWheel(false);
				grid.commitFakeDamages();
				
				
				// check field promotion?
				if (unit.isLeaderAndGrunts()) {
					if (grid.getDamageLines().get(0).getDamageStatus().getRemainingPoints() == 0) {
						// leader is dead! 
						askForPromotion();
					}
				}
				
			}

			
		});
		
		//damageButton.setAttachedGrid( grid);

		unitDamageView = (DamageUnitView) view.findViewById(R.id.damageGridView1);		
		unitDamageView.setGrid(grid);
		
		grid.registerObserver(this);
		
		builder.setView(view);
		// Create the AlertDialog object and return it
		return builder.create();
	}
	
	private void askForPromotion() {
		
		if (getPromotionCandidates().length == 0) {
			return; // nobody to promote!
		}
		
		AlertDialog.Builder alert = new AlertDialog.Builder(getActivity());
		alert.setTitle(R.string.field_promotion);
		
		alert.setItems(getPromotionCandidates(), new DialogInterface.OnClickListener() {
            public void onClick(DialogInterface dialog, int which) {

            	ModelDamageLine promoted = getPromotionCandidatesLines().get(which);
            	ModelDamageLine oldLeader = grid.getMultiPvDamageLines().get(0);
        
            	int i = 0;
            	for (DamageBox box : promoted.getBoxes()) {
            		oldLeader.getBoxes().get(i).setCurrentlyChangePending(box.isCurrentlyChangePending());
            		oldLeader.getBoxes().get(i).setDamaged(box.isDamaged());
            		oldLeader.getBoxes().get(i).setDamagedPending(box.isDamagedPending());
            		i++;
            		
            		// fill all promoted boxes
            		box.setDamaged(true);
            		box.setDamagedPending(false);
            		box.setCurrentlyChangePending(false);
            		
            	}
            	
            	unitDamageView.invalidate();
            }
		});
		alert.show();
		
	}

	private String[] getPromotionCandidates() {
		ArrayList<String> promotionCandidates = new ArrayList<String>();
		for ( ModelDamageLine line : grid.getMultiPvDamageLines()) {
			if (line.getDamageStatus().getRemainingPoints() > 0) {
				promotionCandidates.add(line.getModel().getName());	
			}
		}
		return promotionCandidates.toArray(new String[promotionCandidates.size()]);
	}
	
	private ArrayList<ModelDamageLine> getPromotionCandidatesLines() {
		ArrayList<ModelDamageLine> promotionCandidates = new ArrayList<ModelDamageLine>();
		for ( ModelDamageLine line : grid.getMultiPvDamageLines()) {
			if (line.getDamageStatus().getRemainingPoints() > 0) {
				promotionCandidates.add(line);	
			}
		}
		return promotionCandidates;
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
//		else if ( picker == modelNumberPicker) {
//			unitDamageView.setSelectedModelNumber(modelNumberPicker.getValue());
//			damageNumberPicker.setValue(0);
//			damageNumberPicker.setWrapSelectorWheel(false);
//		}
		
	}
	
    public void addDamage(int i) {
    	int modelNumber = unitDamageView.getSelectedModelNumber();
    	grid.applyFakeDamages(modelNumber , i);
    }
    
    public void removeDamage(int i) {
    	int modelNumber =  unitDamageView.getSelectedModelNumber();
    	grid.applyFakeDamages(modelNumber , -i);
    }



	@Override
	public void onChangeDamageStatus(DamageGrid zegrid) {
		if (selectedModelNumber != unitDamageView.getSelectedModelNumber()) {
			selectedModelNumber = unitDamageView.getSelectedModelNumber();
			// update status of number picker depending on damage grid status
			int remainingPoints = grid.getMultiPvDamageLines().get( selectedModelNumber).getDamageStatus().getRemainingPoints();
			damageNumberPicker.setMinValue(0);
			damageNumberPicker.setValue(0);
			damageNumberPicker.setMaxValue(remainingPoints); 
			damageNumberPicker.setWrapSelectorWheel(false);
		}
		
	}
	
	
	
}
