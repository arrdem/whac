package com.schlaf.steam.activities.card;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;
import android.text.Html;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.view.ViewGroup.LayoutParams;
import android.widget.ImageView;
import android.widget.LinearLayout;
import android.widget.ScrollView;
import android.widget.TableLayout;
import android.widget.TextView;

import com.actionbarsherlock.app.SherlockFragment;
import com.schlaf.steam.R;
import com.schlaf.steam.activities.damages.DamageLineView;
import com.schlaf.steam.activities.damages.DamageSpiralView;
import com.schlaf.steam.activities.damages.WarjackDamageGridView;
import com.schlaf.steam.activities.damages.ModelDamageLine;
import com.schlaf.steam.activities.damages.MyrmidonDamageGridView;
import com.schlaf.steam.activities.selectlist.selected.SpellCaster;
import com.schlaf.steam.data.ArmyCommander;
import com.schlaf.steam.data.ArmyElement;
import com.schlaf.steam.data.Capacity;
import com.schlaf.steam.data.ColossalDamageGrid;
import com.schlaf.steam.data.FactionNamesEnum;
import com.schlaf.steam.data.MeleeWeapon;
import com.schlaf.steam.data.MountWeapon;
import com.schlaf.steam.data.MyrmidonDamageGrid;
import com.schlaf.steam.data.RangedWeapon;
import com.schlaf.steam.data.SingleModel;
import com.schlaf.steam.data.Spell;
import com.schlaf.steam.data.Unit;
import com.schlaf.steam.data.Warbeast;
import com.schlaf.steam.data.WarbeastDamageSpiral;
import com.schlaf.steam.data.Warcaster;
import com.schlaf.steam.data.WarjackDamageGrid;
import com.schlaf.steam.data.Warlock;
import com.schlaf.steam.data.Weapon;

public class ViewCardFragment extends SherlockFragment {

	public static final String ID = "ViewCardFragment";
	
	public interface ViewCardActivityInterface {
		public ArmyElement getArmyElement();
		
		public void removeViewCardFragment(View v);
		
		/**
		 * card must be shown full screen
		 * @return
		 */
		public boolean isCardfullScreen();
		
		/**
		 * card has two panels (for landscape view)
		 * @return
		 */
		public boolean isCardDoublePane();
		
		/**
		 * card should be opened in new window
		 * @param v
		 */
		public void viewModelDetailInNewActivity(View v);
		
		/**
		 * card should be opened in fragment or window, depending on current screen disposition
		 * @param v
		 */
		public void viewModelDetail(View v);
		
		/**
		 * card is opened with a single click (else : use long click)
		 * @param singleClick
		 * @return
		 */
		public boolean useSingleClick();
	}
	
	@Override
	public void onAttach(Activity activity) {
		if (activity instanceof ViewCardActivityInterface) {
			Log.d("ViewCardFragment", "onAttach received " + activity.getClass().getName());
		} else {
			throw new UnsupportedOperationException("ViewCardFragment requires a ViewCardActivityInterface as parent activity");
		}
		super.onAttach(activity);
	}

	@Override
	public void onActivityCreated(Bundle savedInstanceState) {
		Log.d("ViewCardFragment", "ViewCardFragment.onActivityCreated");
		super.onActivityCreated(savedInstanceState);
		fillCard( ((ViewCardActivityInterface) getActivity()).getArmyElement());
	}

	@Override
	public View onCreateView(LayoutInflater inflater, ViewGroup container,
			Bundle savedInstanceState) {
		
		
		Log.d("ViewCardFragment", "ViewCardFragment.onCreateView");
		
		View view = inflater.inflate(R.layout.card_fragment,
				container, false);

		return view;		
	}
	
	/**
	 * notify this fragment that a new model has been selected, and to redraw the view
	 */
	public void notifyNewModelToView() {
		Log.d("ViewCardFragment", "notifyNewModelToView");
		fillCard( ((ViewCardActivityInterface) getActivity()).getArmyElement());
		getView().invalidate();
	}

	
	/**
	 * add a drawable icon to the end of the linear layout "title"
	 * 
	 * @param weapon1TitleLayout
	 * @param drawableResource
	 */
	private void addCapacityImage(LinearLayout modelTitleLayout,
			int drawableResource) {
		ImageView imageView = new ImageView(getActivity());
		imageView.setImageResource(drawableResource);
		LayoutParams imageViewLayoutParams = new LayoutParams(
				LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
		imageView.setLayoutParams(imageViewLayoutParams);
		modelTitleLayout.addView(imageView);
	}

	/**
	 * add a drawable icon to the end of the linear layout "title"
	 * 
	 * @param weapon1TitleLayout
	 * @param drawableResource
	 */
	private void addWeaponImage(LinearLayout weapon1TitleLayout,
			int drawableResource) {
		ImageView imageView = new ImageView(getActivity());
		imageView.setImageResource(drawableResource);
	
		LayoutParams imageViewLayoutParams = new LayoutParams(
				LayoutParams.WRAP_CONTENT, LayoutParams.WRAP_CONTENT);
		imageView.setLayoutParams(imageViewLayoutParams);
		weapon1TitleLayout.addView(imageView);
	}

	private String convertCaracToString(int carac) {
		if (carac > 0) {
			return Integer.toString(carac);
		} else {
			return "-";
		}
	}

	/**
	 * fill the complete card layout with data from the ArmyElement
	 * <br>
	 * handles special cases : casters, warjacks with damage grid, spells, feat, attached models, ...
	 * @param element
	 */
	private void fillCard(ArmyElement element) {
	
		TextView title = (TextView) getView().findViewById(R.id.card_title);
		title.setText(element.getFullName());
	
		TextView subtitle = (TextView) getView().findViewById(R.id.card_subtitle);
		subtitle.setText(element.getQualification());
		
		TextView fa = (TextView) getView().findViewById(R.id.card_fa);
		TextView cost = (TextView) getView().findViewById(R.id.card_cost);
		TextView unitSize = (TextView) getView().findViewById(R.id.card_unit_size);
		
		StringBuffer faString = new StringBuffer();
		faString.append("FA:");
		if (element.isUniqueCharacter()) {
			faString.append("C");
		} else if (element.isUnlimitedFA()) {
			faString.append("U");
		} else {
			faString.append(element.getFA());
		}
		fa.setText(faString.toString());
		
		StringBuffer costString = new StringBuffer(12);
		if (element instanceof Warcaster) {
			costString.append("WJ:+").append(Math.abs(element.getBaseCost()));
		} else if (element instanceof Warlock) {
			costString.append("WB:+").append(Math.abs(element.getBaseCost()));
		} else {
			costString.append("PC:").append(element.getBaseCost());
		}
		cost.setText(costString.toString());
		
		if (element instanceof Unit) {
			if ( ((Unit) element).isVariableSize() ) {
				Unit unit = (Unit) element;
				unitSize.setText( unit.getBaseNumberOfModels() + "/" + unit.getFullNumberOfModels() + " models");
				cost.setText( "PC:" + unit.getBaseCost() + "/" + unit.getFullCost() );
			} else {
				unitSize.setText(((Unit) element).getBaseNumberOfModels() + " models");	
			}
		} else {
			unitSize.setVisibility(View.INVISIBLE);
		}
		
	
		int logoId = FactionNamesEnum.getFaction(element.getFaction().getId())
				.getLogoResource();
		ImageView logo = (ImageView) getView().findViewById(R.id.factionLogo);
		logo.setImageResource(logoId);
	
		if (((ViewCardActivityInterface) getActivity()).isCardfullScreen() ){
			// remove title;
			LinearLayout cardManchette = (LinearLayout) getView().findViewById(R.id.card_manchette);
			cardManchette.setVisibility(View.GONE);
			// ((LinearLayout) cardManchette.getParent()).removeView(cardManchette);
		} else {
			TextView shortTitle = (TextView) getView().findViewById(R.id.card_shorttitle);
			shortTitle.setText(element.getFullName());
		}


		LinearLayout uniqueCardContainer = (LinearLayout)  getView().findViewById(R.id.uniqueCardContainer);
		ScrollView secondCardScrollView = (ScrollView)  getView().findViewById(R.id.secondCardScrollView);
		LinearLayout secondCardBaseLayoutTwoRows = (LinearLayout)  getView().findViewById(R.id.secondCardBaseLayoutTwoRows);

		if (((ViewCardActivityInterface) getActivity()).isCardDoublePane() ){
			// cards side to side,
			// delete feat, spells, ... from first card zone
			uniqueCardContainer.removeView(uniqueCardContainer.findViewById(R.id.featView));
			uniqueCardContainer.removeView(uniqueCardContainer.findViewById(R.id.spellView));
			uniqueCardContainer.removeView(uniqueCardContainer.findViewById(R.id.otherView));
		} else {
			// cards in on list from top to bottom
			secondCardBaseLayoutTwoRows.removeView(secondCardBaseLayoutTwoRows.findViewById(R.id.featView));
			secondCardBaseLayoutTwoRows.removeView(uniqueCardContainer.findViewById(R.id.spellView));
			secondCardBaseLayoutTwoRows.removeView(secondCardBaseLayoutTwoRows.findViewById(R.id.otherView));
			secondCardScrollView.setVisibility(View.GONE);
		}
		
		StringBuffer fullText = new StringBuffer(512);
		
		if (element.getModels() != null && element.getModels().size() > 0) {
			int elementCount = 0;
			for (SingleModel model : element.getModels()) {
				View modelView = null;
				if (elementCount == 0) {
					// reuse basic model view
					modelView = (View) getView().findViewById(R.id.modelgrid);
				} else {
					// create new model view
					LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
					modelView = inflater.inflate(R.layout.model_grid, null, true);
					// and add to list
					int childCount = uniqueCardContainer.getChildCount();
					int featViewIndex = 0;
					for ( int i = 0; i < childCount; i++) {
						if (uniqueCardContainer.getChildAt(i).getId() == R.id.featView) {
							featViewIndex = i;
							break;
						}
					}
					if (featViewIndex == 0) {
						uniqueCardContainer.addView(modelView); // append at end of card
					} else {
						uniqueCardContainer.addView(modelView, featViewIndex); // insert just before feat	
					}
					
				}
				fillModel(model, modelView, element, elementCount==0);
				
				// fill model capacities
				if (! model.getCapacities().isEmpty()) {
					
					if (elementCount > 0 && fullText.length() > 0) {
						fullText.append("<BR>");
					}
					
					fullText.append("<U><B>").append(model.getName()).append("</B></U><BR>");
					for (Capacity capacity : model.getCapacities()) {
						fullText.append("<B>").append(capacity.getTitle()).append("</B>");
						if (capacity.getType() !=null && capacity.getType().trim().length() > 0) {
							fullText.append("[").append(capacity.getType()).append("]");
						}
						fullText.append(" - ").append(capacity.getLabel()).append("<BR>");
					}
				}
				
				elementCount++;
			}
		}
		
		element.setCardFullText(fullText.toString());
		
		boolean secondCardHasData = false;
		
		if (element instanceof ArmyCommander ) {
			View featView = (View) getView().findViewById(R.id.featView);
			
			TextView featTitle = (TextView) featView.findViewById(R.id.featTitle);
			featTitle.setText(((ArmyCommander) element).getFeatTitle());
			
			TextView featText = (TextView) featView.findViewById(R.id.featTextView);
			featText.setText(((ArmyCommander) element).getFeatContent());
	
			secondCardHasData = true;
		} else {
			View featView = (View) getView().findViewById(R.id.featView);
			featView.setVisibility(View.GONE);
		}
		
		if (element instanceof SpellCaster) {
			View spellView = (View) getView().findViewById(R.id.spellView);
			
			TableLayout spellTable = (TableLayout) spellView.findViewById(R.id.spellTable);
			
			spellTable.removeView(spellTable.findViewById(R.id.toRemove1));
			spellTable.removeView(spellTable.findViewById(R.id.toRemove2));
			
			for (Spell spell : ((SpellCaster)element).getSpells()) {
				View spellLineCaracView = getLayoutInflater(null).inflate(R.layout.spell_line_carac, null, false);	
				((TextView) spellLineCaracView.findViewById(R.id.spellTitle)).setText(spell.getTitle());
				((TextView) spellLineCaracView.findViewById(R.id.spellCost)).setText(spell.getCost()); 
				((TextView) spellLineCaracView.findViewById(R.id.spellRange)).setText(spell.getRange());
				((TextView) spellLineCaracView.findViewById(R.id.spellAOE)).setText(spell.getAoe());
				((TextView) spellLineCaracView.findViewById(R.id.spellPOW)).setText(spell.getPow());
				((TextView) spellLineCaracView.findViewById(R.id.spellUP)).setText(spell.getUpkeep());
				((TextView) spellLineCaracView.findViewById(R.id.spellOFF)).setText(spell.getOffensive());
				spellTable.addView(spellLineCaracView);
				
				View spellLineTextView = getLayoutInflater(null).inflate(R.layout.spell_line_text, null, false);
				((TextView) spellLineTextView.findViewById(R.id.spellDescription)).setText(Html.fromHtml(spell.getFullText()));
				spellTable.addView(spellLineTextView);
			}
			secondCardHasData = true;

		}  else {
			View spellView = (View) getView().findViewById(R.id.spellView);
			spellView.setVisibility(View.GONE);
		}
	
		if (element.getCardFullText() != null && element.getCardFullText().trim().length() > 0) {
			View otherView = (View) getView().findViewById(R.id.otherView);
			TextView otherText = (TextView) otherView
					.findViewById(R.id.detailText);
			otherText.setText(Html.fromHtml(element.getCardFullText()));
			secondCardHasData = true;
		} else {
			View otherView = (View) getView().findViewById(R.id.otherView);
			otherView.setVisibility(View.GONE);
			// secondCardLayout.removeView(otherView);
		}
		
		if (!secondCardHasData) {
			secondCardScrollView.setVisibility(View.GONE);
		}
		
	}

	private void fillModel(SingleModel element, View container, ArmyElement parent, boolean firstModel) {
	
		View baseStatsView = (View) container.findViewById(R.id.basestats);
		generateBaseStatView(baseStatsView, element);
	
		// generate focus/fury
		ImageView image = (ImageView) container.findViewById(R.id.imageView1);
		ImageView imageThr = (ImageView) container.findViewById(R.id.imageViewThreshold);
		Log.d("ViewCardFragment", "army element class = " + parent.getClass().getName());
		if (firstModel) {
			if (parent instanceof Warcaster ) {
				Log.d("ViewCardFragment", "warcaster : focus = " + ((Warcaster) parent).getFocus());
				switch ( ((Warcaster) parent).getFocus()) {
				case 3: 
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_3_icon)); break;
				case 4:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_4_icon)); break;
				case 5:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_5_icon)); break;
				case 6:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_6_icon)); break;
				case 7:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_7_icon)); break;
				case 8:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_8_icon)); break;
				case 9:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_9_icon)); break;
				case 10:
					image.setImageDrawable(getResources().getDrawable(R.drawable.focus_10_icon)); break;
				default:
					image.setImageDrawable(getResources().getDrawable(R.drawable.empty));
				}
				imageThr.setImageDrawable(getResources().getDrawable(R.drawable.empty));
			} else if (parent instanceof Warlock ) {
				switch ( ((Warlock) parent).getFury()) {
				case 3: 
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_3_icon)); break;
				case 4:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_4_icon)); break;
				case 5:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_5_icon)); break;
				case 6:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_6_icon)); break;
				case 7:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_7_icon)); break;
				case 8:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_8_icon)); break;
				default:
					image.setImageDrawable(getResources().getDrawable(R.drawable.empty));
				}
				imageThr.setImageDrawable(getResources().getDrawable(R.drawable.empty));
			} else if (parent instanceof Warbeast) {
				switch ( ((Warbeast) parent).getFury()) {
				case 2: 
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_2_icon)); break;
				case 3: 
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_3_icon)); break;
				case 4:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_4_icon)); break;
				case 5:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_5_icon)); break;
				case 6:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_6_icon)); break;
				case 7:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_7_icon)); break;
				case 8:
					image.setImageDrawable(getResources().getDrawable(R.drawable.fury_8_icon)); break;
				default:
					image.setImageDrawable(getResources().getDrawable(R.drawable.empty));
				}
				switch ( ((Warbeast) parent).getThreshold()) {
				case 3: 
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_3_icon)); break;
				case 4:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_4_icon)); break;
				case 5:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_5_icon)); break;
				case 6:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_6_icon)); break;
				case 7:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_7_icon)); break;
				case 8:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_8_icon)); break;
				case 9:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_9_icon)); break;
				case 10:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_10_icon)); break;
				case 11:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.thr_11_icon)); break;
				default:
					imageThr.setImageDrawable(getResources().getDrawable(R.drawable.empty));
				}
			}else {
				imageThr.setImageDrawable(getResources().getDrawable(R.drawable.empty));
				image.setImageDrawable(getResources().getDrawable(R.drawable.empty));
			}			
		} else {
			image.setImageDrawable(getResources().getDrawable(R.drawable.empty));;
			imageThr.setImageDrawable(getResources().getDrawable(R.drawable.empty));
		}

		
		LinearLayout weaponsLayout = (LinearLayout) container.findViewById(R.id.layout_weapons);
		weaponsLayout.removeAllViews();
	
//		if (element.getWeapons() == null || element.getWeapons().isEmpty()) {
//			LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
//			View noWeaponView = inflater.inflate(R.layout.no_weapon, null,true);
//			weaponsLayout.addView(noWeaponView);
//		}
		
		for (Weapon weapon : element.getWeapons()) {
			if (weapon instanceof MeleeWeapon) {
				View meleeWeaponView = generateMeleeWeaponView((MeleeWeapon) weapon);
				weaponsLayout.addView(meleeWeaponView);
			} else if (weapon instanceof RangedWeapon) {
				View rangedWeaponView = generateRangedWeaponView((RangedWeapon) weapon);
				weaponsLayout.addView(rangedWeaponView);
			} else if (weapon instanceof MountWeapon) {
				View mountWeaponView = generateMountWeaponView((MountWeapon) weapon);
				weaponsLayout.addView(mountWeaponView);
			} 
				
		}
	
		// handle damage grid
		LinearLayout layoutGrid = (LinearLayout) container;
		// if (parent instanceof Warjack || parent instanceof Warcaster) {
			if (element.getHitpoints() instanceof WarjackDamageGrid ) {
				WarjackDamageGridView gridView = (WarjackDamageGridView) layoutGrid.findViewById(R.id.gridView1);
				gridView.setGrid((WarjackDamageGrid)element.getHitpoints());
				gridView.setEdit(false);
			} else {
				WarjackDamageGridView gridView = (WarjackDamageGridView) layoutGrid.findViewById(R.id.gridView1);
				gridView.setVisibility(View.GONE);
			}
			
			if (element.getHitpoints() instanceof MyrmidonDamageGrid ) {
				MyrmidonDamageGridView gridView = (MyrmidonDamageGridView) layoutGrid.findViewById(R.id.myrmidonView1);
				gridView.setGrid((MyrmidonDamageGrid)element.getHitpoints());
				gridView.setEdit(false);
			} else {
				MyrmidonDamageGridView gridView = (MyrmidonDamageGridView) layoutGrid.findViewById(R.id.myrmidonView1);
				gridView.setVisibility(View.GONE);
			}

			if (element.getHitpoints() instanceof ColossalDamageGrid) {
				LinearLayout gridView = (LinearLayout) layoutGrid.findViewById(R.id.colossalView1);
				WarjackDamageGridView leftGrid = (WarjackDamageGridView) gridView.findViewById(R.id.gridViewLeft);
				WarjackDamageGridView rightGrid = (WarjackDamageGridView) gridView.findViewById(R.id.gridViewRight);
				DamageLineView forceFieldGrid = (DamageLineView) gridView.findViewById(R.id.damageLineForceField);
				leftGrid.setGrid( ((ColossalDamageGrid) element.getHitpoints()).getLeftGrid());
				rightGrid.setGrid( ((ColossalDamageGrid) element.getHitpoints()).getRightGrid());
				
				if ( ((ColossalDamageGrid) element.getHitpoints()).getForceFieldGrid() != null) {
					forceFieldGrid.setVisibility(View.VISIBLE);
					forceFieldGrid.setForceField(true);
					forceFieldGrid.setDamageLine(((ColossalDamageGrid) element.getHitpoints()).getForceFieldGrid());
					forceFieldGrid.setEdit(false);
				} else {
					forceFieldGrid.setVisibility(View.GONE);
				}
				
				
			} else {
				LinearLayout gridView = (LinearLayout) layoutGrid.findViewById(R.id.colossalView1);
				gridView.setVisibility(View.GONE);
			}
			
			if (element.getHitpoints() instanceof WarbeastDamageSpiral ) {
				DamageSpiralView spiralView = (DamageSpiralView) layoutGrid.findViewById(R.id.spiralView1);
				spiralView.setSpiral((WarbeastDamageSpiral)element.getHitpoints());
				spiralView.setEdit(false);
			} else {
				DamageSpiralView spiralView = (DamageSpiralView) layoutGrid.findViewById(R.id.spiralView1);
				spiralView.setVisibility(View.GONE);
			}

			
			LinearLayout lineView = (LinearLayout) layoutGrid.findViewById(R.id.lineView1);
			if (element.getHitpoints() instanceof ModelDamageLine) {
				TextView tvDamages = (TextView) lineView.findViewById(R.id.hit_points);
				tvDamages.setText(element.getHitpoints().getTotalHits() + " HP");
				//lineView.setDamageLine((ModelDamageLine) element.getHitpoints());
				//lineView.setEdit(true);
			} else {
				lineView.setVisibility(View.GONE);
			}
		
//			View spiralView = (View) getView().findViewById(R.id.spiralView1);
//			layoutGrid.removeView(spiralView);
			// spiralView.setVisibility(View.GONE);
			// }		
//		} else {
//			layoutGrid.setVisibility(View.GONE);
//		}
		
		// force redraw?
		container.invalidate();
		
	}

	/**
	 * feeds the baseStats grid with values from army element
	 * 
	 * @param baseStatsView
	 * @param element
	 */
	private void generateBaseStatView(View baseStatsView, SingleModel element) {
		TextView name = (TextView) baseStatsView.findViewById(R.id.carac_name);
		TextView spd = (TextView) baseStatsView
				.findViewById(R.id.carac_spd_value);
		TextView str = (TextView) baseStatsView
				.findViewById(R.id.carac_str_value);
		TextView mat = (TextView) baseStatsView
				.findViewById(R.id.carac_mat_value);
		TextView rat = (TextView) baseStatsView
				.findViewById(R.id.carac_rat_value);
		TextView def = (TextView) baseStatsView
				.findViewById(R.id.carac_def_value);
		TextView arm = (TextView) baseStatsView
				.findViewById(R.id.carac_arm_value);
		TextView cmd = (TextView) baseStatsView
				.findViewById(R.id.carac_cmd_value);
	
		name.setText(element.getName());
		spd.setText(convertCaracToString(element.getSPD()));
		str.setText(convertCaracToString(element.getSTR()));
		mat.setText(convertCaracToString(element.getMAT()));
		rat.setText(convertCaracToString(element.getRAT()));
		def.setText(convertCaracToString(element.getDEF()));
		arm.setText(convertCaracToString(element.getARM()));
		cmd.setText(convertCaracToString(element.getCMD()));
	
		// generate special capacities icons
		LinearLayout titleLinearLayout = (LinearLayout) baseStatsView
				.findViewById(R.id.model_title_linear_layout);
		titleLinearLayout.removeAllViews();
	
		if (element.isAbomination()) {
			addCapacityImage(titleLinearLayout, R.drawable.abomination_icon);
		}
		if (element.isAdvanceDeployment()) {
			addCapacityImage(titleLinearLayout, R.drawable.advance_deployment_icon);
		}
		if (element.isArcNode()) {
			addCapacityImage(titleLinearLayout, R.drawable.arcnode_icon);
		}
		if (element.isCra()) {
			addCapacityImage(titleLinearLayout, R.drawable.cra_icon);
		}
		if (element.isCma()) {
			addCapacityImage(titleLinearLayout, R.drawable.cma_icon);
		}
		if (element.isCommander()) {
			addCapacityImage(titleLinearLayout, R.drawable.commander_icon);
		}
		if (element.isConstruct()) {
			addCapacityImage(titleLinearLayout, R.drawable.construct_icon);
		}
		if (element.isEyelessSight()) {
			addCapacityImage(titleLinearLayout, R.drawable.eyeless_sight);
		}
		if (element.isFearless()) {
			addCapacityImage(titleLinearLayout, R.drawable.fearless_icon);
		}
		if (element.isGunfighter()) {
			addCapacityImage(titleLinearLayout, R.drawable.gunfighter);
		}
		if (element.isIncorporeal()) {
			addCapacityImage(titleLinearLayout, R.drawable.incorporeal_icon);
		}
		if (element.isJackMarshal()) {
			addCapacityImage(titleLinearLayout, R.drawable.jack_marshal_icon);
		}
		if (element.isOfficer()) {
			addCapacityImage(titleLinearLayout, R.drawable.officer_icon);
		}
		if (element.isPathfinder()) {
			addCapacityImage(titleLinearLayout, R.drawable.pathfinder_icon);
		}
		if (element.isStandardBearer()) {
			addCapacityImage(titleLinearLayout, R.drawable.standard_bearer_icon);
		}
		if (element.isStealth()) {
			addCapacityImage(titleLinearLayout, R.drawable.stealth_icon);
		}
		if (element.isTerror()) {
			addCapacityImage(titleLinearLayout, R.drawable.terror_icon);
		}
		if (element.isTough()) {
			addCapacityImage(titleLinearLayout, R.drawable.tough_icon);
		}
		if (element.isUndead()) {
			addCapacityImage(titleLinearLayout, R.drawable.undead_icon);
		}
		if (element.isImmunityFire()) {
			addCapacityImage(titleLinearLayout, R.drawable.immunity_fire_icon);
		}
		if (element.isImmunityCorrosion()) {
			addCapacityImage(titleLinearLayout, R.drawable.immunity_corrosion_icon);
		}
		if (element.isImmunityElectricity()) {
			addCapacityImage(titleLinearLayout, R.drawable.immunity_electricity_icon);
		}
		if (element.isImmunityFrost()) {
			addCapacityImage(titleLinearLayout, R.drawable.immunity_frost_icon);
		}
	
		if (element.getWeapons().isEmpty()) {
			addCapacityImage(titleLinearLayout, R.drawable.no_melee_icon);
			addCapacityImage(titleLinearLayout, R.drawable.no_ranged_icon);
		}
		
	}

	/**
	 * feeds the melee weapon grid with weapon caracs and return new View <br>
	 * caller must add the view to the underlying layout
	 * 
	 * @param weapon
	 * @return View
	 */
	private View generateMeleeWeaponView(MeleeWeapon weapon) {
		LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	
		View meleeWeaponView = inflater.inflate(R.layout.melee_weapon, null,
				true);
	
		generateWeaponIcons(weapon, meleeWeaponView);
	
		// weapon POW and P+S
		TextView weaponTitle = (TextView) meleeWeaponView
				.findViewById(R.id.text_weapon_name);
		TextView weaponPow = (TextView) meleeWeaponView
				.findViewById(R.id.carac_pow_value);
		TextView weaponP_plus_s = (TextView) meleeWeaponView
				.findViewById(R.id.carac_p_plus_s_value);
		TextView weaponCapacities = (TextView) meleeWeaponView
				.findViewById(R.id.weaponCapacitiesText);
	
		generateWeaponName(weapon, weaponTitle);
	
		generateWeaponCapacities(weapon, weaponCapacities);
		
		
		weaponPow.setText(convertCaracToString(weapon.getPow()));
		weaponP_plus_s.setText(convertCaracToString(weapon.getP_plus_s()));
	
		return meleeWeaponView;
	}

	private void generateWeaponCapacities(Weapon weapon,
			TextView weaponCapacities) {
		StringBuffer weaponCapacitiesBf = new StringBuffer(256);
		if (! weapon.getCapacities().isEmpty() ) {
			for (Capacity capacity : weapon.getCapacities()) {
				weaponCapacitiesBf.append("<B>").append(capacity.getTitle()).append("</B>");
				if (capacity.getType() !=null) {
					weaponCapacitiesBf.append("[").append(capacity.getType()).append("]");
				}
				weaponCapacitiesBf.append(" - ").append(capacity.getLabel()).append("<BR>");
			}
			weaponCapacities.setText(Html.fromHtml(weaponCapacitiesBf.toString()));
		} else {
			weaponCapacities.setVisibility(View.GONE);	
		}
	}

	/**
	 * feeds the mount weapon grid with weapon caracs and return new View <br>
	 * caller must add the view to the underlying layout
	 * 
	 * @param weapon
	 * @return View
	 */
	
	private View generateMountWeaponView(MountWeapon weapon) {
		LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	
		View mountWeaponView = inflater.inflate(R.layout.mount_weapon, null,
				true);
		TextView weaponTitle = (TextView) mountWeaponView
				.findViewById(R.id.text_weapon_name);
		TextView weaponPow = (TextView) mountWeaponView
				.findViewById(R.id.carac_pow_value);
		TextView weaponCapacities = (TextView) mountWeaponView
				.findViewById(R.id.weaponCapacitiesText);
		
		
		generateWeaponName(weapon, weaponTitle);
		generateWeaponCapacities(weapon, weaponCapacities);
	
		weaponPow.setText(convertCaracToString(weapon.getPow()));
	
		generateWeaponIcons(weapon, mountWeaponView);
	
		return mountWeaponView;
	}

	/**
	 * feeds the ranged weapon grid with weapon caracs and return new View <br>
	 * caller must add the view to the underlying layout
	 * 
	 * @param weapon
	 * @return View
	 */
	
	private View generateRangedWeaponView(RangedWeapon weapon) {
		LayoutInflater inflater = (LayoutInflater) getActivity().getSystemService(Context.LAYOUT_INFLATER_SERVICE);
	
		View rangedWeaponView = inflater.inflate(R.layout.ranged_weapon, null,
				true);
		TextView weaponTitle = (TextView) rangedWeaponView
				.findViewById(R.id.text_weapon_name);
		TextView weaponRng = (TextView) rangedWeaponView
				.findViewById(R.id.carac_rng_value);
		TextView weaponRof = (TextView) rangedWeaponView
				.findViewById(R.id.carac_rof_value);
		TextView weaponAoe = (TextView) rangedWeaponView
				.findViewById(R.id.carac_aoe_value);
		TextView weaponPow = (TextView) rangedWeaponView
				.findViewById(R.id.carac_pow_value);
		TextView weaponCapacities = (TextView) rangedWeaponView
				.findViewById(R.id.weaponCapacitiesText);
		
		generateWeaponName(weapon, weaponTitle);
	
		generateWeaponCapacities(weapon, weaponCapacities);
		
		if (weapon.isSpray()) {
			weaponRng.setText("SP" + convertCaracToString(weapon.getRange()));
		} else {
			weaponRng.setText(convertCaracToString(weapon.getRange()));
		}
		weaponRof.setText(convertCaracToString(weapon.getRof()));
		weaponAoe.setText(convertCaracToString(weapon.getAoe()));
		weaponPow.setText(convertCaracToString(weapon.getPow()));
	
		generateWeaponIcons(weapon, rangedWeaponView);
	
		return rangedWeaponView;
	}

	/**
	 * generate weapon icons in the weapon view.
	 * 
	 * @param weapon
	 * @param weaponView
	 */
	private void generateWeaponIcons(Weapon weapon, View weaponView) {
		// remove every weapon icons from linear layout
		LinearLayout weapon1TitleLayout = (LinearLayout) weaponView
				.findViewById(R.id.weapon_title_linear_layout);
		int nbViews = weapon1TitleLayout.getChildCount();
		weapon1TitleLayout.removeViewsInLayout(1, nbViews - 1);
	
		// add weapon icons to linear layout
		if (weapon.isMagical()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.magical_weapon_icon);
		}
		if (weapon instanceof MeleeWeapon) {
			if (((MeleeWeapon) weapon).isReach()) {
				addWeaponImage(weapon1TitleLayout, R.drawable.reach_icon);
			}
			if (((MeleeWeapon) weapon).isShield()) {
				addWeaponImage(weapon1TitleLayout, R.drawable.shield_icon);
			}
			if (((MeleeWeapon) weapon).isOpenFist()) {
				addWeaponImage(weapon1TitleLayout, R.drawable.open_fist_icon);
			}
			if (((MeleeWeapon) weapon).isBuckler()) {
				addWeaponImage(weapon1TitleLayout, R.drawable.buckler_icon);
			}
			if (((MeleeWeapon) weapon).isChain()) {
				addWeaponImage(weapon1TitleLayout, R.drawable.chain_weapon);
			}
		}
		if (weapon.isFire()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.fire_icon);
		}
		if (weapon.isContinuousFire()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.continuous_fire_icon);
		}
		if (weapon.isCorrosion()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.corrosion_icon);
		}
		if (weapon.isContinuousCorrosion()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.continuous_corrosion_icon);
		}
		if (weapon.isWeaponMaster()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.weapon_master_icon);
		}
		if (weapon.isCriticalFire()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.critical_fire_icon);
		}
		if (weapon.isCriticalCorrosion()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.critical_corrosion_icon);
		}
		if (weapon.isFrost()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.frost);
		}
		if (weapon.isElectricity()) {
			addWeaponImage(weapon1TitleLayout, R.drawable.electricity_icon);
		}
	}

	private void generateWeaponName(Weapon weapon, TextView weaponTitle) {
		StringBuffer weaponName = new StringBuffer();
		if (weapon.hasLocation()) {
			weaponName.append("[").append(weapon.getLocation()).append("] ");
		}
		weaponName.append(weapon.getName());
		if (weapon.getCount() > 1) {
			weaponName.append("[x").append(weapon.getCount()).append("] ");
		}
		weaponTitle.setText(weaponName.toString());
	}

}
